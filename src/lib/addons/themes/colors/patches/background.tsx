import { colorsPref } from "@lib/addons/themes/colors/preferences";
import { _colorRef } from "@lib/addons/themes/colors/updater";
import { after } from "@lib/api/patcher";
import { useObservable } from "@lib/api/storage";
import { findInReactTree } from "@lib/utils";
import { findByDisplayNameLazy } from "@metro";
import chroma from "chroma-js";
import { ImageBackground, StyleSheet } from "react-native";
import { logger } from "@lib/utils/logger";

const Messages = findByDisplayNameLazy("MessagesConnected");

function ThemeBackground({ children }: { children: React.ReactNode; }) {
    useObservable([colorsPref]);

    if (!_colorRef.current
        || colorsPref.customBackground === "hidden"
        || !_colorRef.current.background?.url
        || _colorRef.current.background?.blur && (typeof _colorRef.current.background?.blur !== "number")
    ) {
        return children;
    }

    return <ImageBackground
        style={{ flex: 1, height: "100%" }}
        source={{ uri: _colorRef.current.background?.url }}
        blurRadius={_colorRef.current.background?.blur}
    >
        {children}
    </ImageBackground>;
}

export default function patchChatBackground() {
    // chroma()'s alpha/hex conversion is expensive and this runs on every render of the main
    // message list (i.e. constantly) - the raw color + opacity rarely change between renders, so
    // skip recomputing when the inputs match the last render's.
    let lastInput: string | null = null;
    let lastResult: string | null = null;

    try {
        const patches = [
            after("render", Messages, (_, ret) => {
                if (!_colorRef.current || !_colorRef.current.background?.url) return;

                const messagesComponent = findInReactTree(
                    ret,
                    x => x && "HACK_fixModalInteraction" in x.props && x?.props?.style
                );

                if (messagesComponent) {
                    const flattened = StyleSheet.flatten(messagesComponent.props.style);
                    const rawColor = flattened.backgroundColor || "black";
                    const opacity = 1 - (_colorRef.current.background?.opacity ?? 1);
                    const input = `${rawColor}|${opacity}`;

                    let backgroundColor: string;
                    if (input === lastInput && lastResult) {
                        backgroundColor = lastResult;
                    } else {
                        backgroundColor = chroma(rawColor).alpha(opacity).hex();
                        lastInput = input;
                        lastResult = backgroundColor;
                    }

                    messagesComponent.props.style = StyleSheet.flatten([
                        messagesComponent.props.style,
                        { backgroundColor }
                    ]);
                }

                return <ThemeBackground>{ret}</ThemeBackground>;
            })
        ];

        return () => patches.forEach(x => x());
    } catch (e) {
        logger.error("Failed to patch chat background.", e);
        return () => { };
    }
}
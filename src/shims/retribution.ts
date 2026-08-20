// This shim provides the "retribution" module that plugins import from.
// It re-exports the window.retribution API object at runtime.
// For build-time types, see src/shims/retribution.d.ts

const retribution = window.retribution;

export const patcher = retribution.patcher;
export const metro = retribution.metro;
export const constants = retribution.constants;
export const utils = retribution.utils;
export const debug = retribution.debug;
export const ui = retribution.ui;
export const plugins = retribution.plugins;
export const themes = retribution.themes;
export const commands = retribution.commands;
export const storage = retribution.storage;
export const settings = retribution.settings;
export const loader = retribution.loader;
export const logger = retribution.logger;
export const version = retribution.version;

export default retribution;
export { retribution };

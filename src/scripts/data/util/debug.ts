import config from "./config";

/* * Debugging utility functions for ReplayCraft.
 * These functions log messages to the console only if debugging is enabled in the config.
 **/

export function debugLog(...args: any[]) {
    if (config.debugEnabled) {
        console.log("[ReplayCraft DEBUG]", ...args);
    }
}

export function debugWarn(...args: any[]) {
    if (config.debugEnabled) {
        console.warn("[ReplayCraft DEBUG]", ...args);
    }
}

export function debugError(...args: any[]) {
    if (config.debugEnabled) {
        console.error("[ReplayCraft DEBUG]", ...args);
    }
}

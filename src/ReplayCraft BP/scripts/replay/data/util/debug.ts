import config from "./config";

/* * Debugging utility functions for rc1.
 * These functions log messages to the console only if debugging is enabled in the config.
 **/

export function debugLog(...args: any[]) {
    if (config.debugEnabled) {
        debugLog("[ReplayCraft DEBUG]", ...args);
    }
}

export function debugWarn(...args: any[]) {
    if (config.debugEnabled) {
        debugWarn("[ReplayCraft DEBUG]", ...args);
    }
}

export function debugError(...args: any[]) {
    if (config.debugEnabled) {
        debugError("[ReplayCraft DEBUG]", ...args);
    }
}

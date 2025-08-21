import { PlayerLeaveAfterEvent, world } from "@minecraft/server";
import { replayCraftActiveSessionsDB } from "./world-initialize";
import { replaySessions } from "../../data/replay-player-session";
import config from "../../data/util/config";
import { debugLog } from "../../data/util/debug";
/**
 * Function to execute when a player leaves.
 * Initializes event handlers for player leave events.
 */
export function onPlayerLeave() {
    initializeEventHandlers();
}

/**
 * Function to initialize event handlers for player spawn events.
 * Subscribes to the player spawn event to handle additional logic.
 */
function initializeEventHandlers() {
    world.afterEvents.playerLeave.subscribe(handlePlayerLeave);
}

/**
 * Handles player leave events.
 * This function is triggered when a player spawns in the world.
 * @param {PlayerLeaveAfterEvent} event - The event object containing information about player spawn.
 */
function handlePlayerLeave(event: PlayerLeaveAfterEvent) {
    /**
     * Delete the player session from the active sessions database when a player leaves.
     */
    replayCraftActiveSessionsDB.delete(event.playerId);
    if (replaySessions.playerSessions.has(event.playerId)) {
        replaySessions.playerSessions.delete(event.playerId);
        if (config.debugPlayerLeaveAfterEvent === true) {
            debugLog(` Session deleted for player ${event.playerId} From playerSessions Map and replayCraftActiveSessionsDB`);
        }
    }
}

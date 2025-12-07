//@ts-check
import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";

/**
 * Clears all guest entries from a Map, keeping only the controller.
 * @param {Map<string, any>} map - The map containing per-player data.
 * @param {string} controllerId - The player ID of the controller/host to keep.
 */
function clearGuestMapEntries(map: Map<string, any>, controllerId: string) {
    for (const id of Array.from(map.keys())) {
        if (id !== controllerId) {
            map.delete(id); // remove guest
        }
    }
}

/**
 * Clears all guest replay data from a session, keeping only the controller.
 * Also ensures that allRecordedPlayerIds contains only the controller.
 * @param {Player} controller - The host player whose data should be preserved.
 */
function clearGuestData(controller: Player) {
    const session = replaySessions.playerSessions.get(controller.id);
    if (!session) return;

    // List of all per-player maps that need guest entries cleared
    const perPlayerMaps: (keyof typeof session)[] = [
        "replayBlockStateMap",
        "replayBlockInteractionAfterMap",
        "replayBlockInteractionBeforeMap",
        "replayPositionDataMap",
        "replayRotationDataMap",
        "replayActionDataMap",
        "replayEntityDataMap",
        "replayAmbientEntityMap",
        "replayEquipmentDataMap",
        "trackedPlayerJoinTicks",
        "playerDamageEventsMap",
        "playerItemUseDataMap",
    ];

    // Clear all guests from each map
    for (const prop of perPlayerMaps) {
        const mapCandidate = session[prop];
        if (mapCandidate instanceof Map) {
            clearGuestMapEntries(mapCandidate, controller.id);
        }
    }

    // Remove all guests from trackedPlayers array, keep only controller
    session.trackedPlayers = session.trackedPlayers.filter((p) => p.id === controller.id);

    // Reset allRecordedPlayerIds to include only the controller
    session.allRecordedPlayerIds.clear();
    session.allRecordedPlayerIds.add(controller.id);
}

/**
 * Resets the replay session for the controller player.
 * This includes clearing all guests, resetting controller maps, and session flags.
 * @param {Player} player - The controller player whose session will be reset.
 */
export function resetRec(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    // Step 1: Clear all guest data
    clearGuestData(player);

    // Step 2: Reset session-wide flags
    session.replayController = undefined;
    session.isReplayActive = false;
    session.recordingEndTick = 0;
    session.currentTick = 0;
    session.replaySpeed = 1;

    // Step 3: Reset the controller's maps
    const id = player.id;
    session.replayBlockStateMap.set(id, { blockStateChanges: {} });
    session.replayBlockInteractionAfterMap.set(id, { blockSateAfterInteractions: {} });
    session.replayBlockInteractionBeforeMap.set(id, { blockStateBeforeInteractions: {} });
    session.replayPositionDataMap.set(id, { recordedPositions: [], recordedVelocities: [] });
    session.replayRotationDataMap.set(id, { recordedRotations: [] });
    session.replayActionDataMap.set(id, {
        isSneaking: [],
        isSwimming: [],
        isClimbing: [],
        isFalling: [],
        isFlying: [],
        isGliding: [],
        isRiding: [],
        isSprinting: [],
        isSleeping: [],
        ridingTypeId: [],
        isCrawling: [],
    });
    session.replayEntityDataMap.set(id, { customEntity: undefined });
    session.replayAmbientEntityMap.set(id, new Map());
    session.replayEquipmentDataMap.set(id, {
        weapon1: [],
        weapon2: [],
        armor1: [],
        armor2: [],
        armor3: [],
        armor4: [],
    });
    session.trackedPlayerJoinTicks.set(id, { joinTick: 0, name: player.name });
    session.playerDamageEventsMap.set(id, undefined);
    if (session.playerItemUseDataMap) {
        session.playerItemUseDataMap.set(id, undefined);
    }

    // Ensure controller is included in recorded IDs
    session.allRecordedPlayerIds.add(id);
}

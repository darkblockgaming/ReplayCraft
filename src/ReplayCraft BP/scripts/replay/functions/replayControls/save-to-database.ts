import { Player } from "@minecraft/server";
import {
    replayCraftBlockDB,
    replayCraftPlayerActionsDB,
    replayCraftPlayerPosDB,
    replayCraftPlayerRotDB,
    replayCraftBlockInteractionsDB,
    replayCraftBeforeBlockInteractionsDB,
    replayCraftSettingsDB,
    replayCraftPlaybackEntityDB,
    replayCraftPlayerArmorWeaponsDB,
    replayCraftAmbientEntityDB,
    replayCraftAllRecordedPlayerIdsDB,
    replayCraftTrackedPlayerJoinTicksDB,
    replayCraftPlayerDamageEventsDB,
} from "../../classes/subscriptions/world-initialize";
import { PlayerReplaySession } from "../../data/replay-player-session";
import { debugLog, debugWarn } from "../../data/util/debug";

export function saveToDB(player: Player, session: PlayerReplaySession) {
    // Safety check for multiplayer array in session
    if (!Array.isArray(session.trackedPlayers) || session.trackedPlayers.length === 0) {
        debugWarn("No players found in session.trackedPlayers.");
        return;
    }
    // Save the allRecordedPlayerIds for just this player and session
    const playerAllRecordedPlayerIdsData = session.allRecordedPlayerIds;
    if (!playerAllRecordedPlayerIdsData) {
        debugWarn(`Missing allRecordedPlayerIds data for player ${player.id}`);
    } else {
        // Convert Set to Array for saving
        const arrayToSave = Array.from(playerAllRecordedPlayerIdsData);
        replayCraftAllRecordedPlayerIdsDB.set(player.id + session.buildName, arrayToSave);
    }

    // Save per-player data from session maps
    for (const playerId of session.allRecordedPlayerIds) {
        debugLog(`Saving data for player: ${player.name} playerId: (${playerId})`);

        const PlayerBlockData = session.replayBlockStateMap.get(playerId);
        const playerPositionData = session.replayPositionDataMap.get(playerId);
        const playerRotationData = session.replayRotationDataMap.get(playerId);
        const playerActionsData = session.replayActionDataMap.get(playerId);
        const playerBlockInteractionsData = session.replayBlockInteractionAfterMap.get(playerId);
        const playerBeforeBlockInteractionsData = session.replayBlockInteractionBeforeMap.get(playerId);
        const playBackEntityData = session.replayEntityDataMap.get(playerId);
        const playerArmorWeaponsData = session.replayEquipmentDataMap.get(playerId);
        const playerAmbientEntityData = session.replayAmbientEntityMap.get(playerId);
        const playerTrackedPlayerJoinTicks = session.trackedPlayerJoinTicks.get(playerId);
        const playerDamageEventData = session.playerDamageEventsMap.get(playerId);

        if (!PlayerBlockData) debugWarn(`Missing block data for player ${playerId}`);
        if (!playerPositionData) debugWarn(`Missing position data for player ${playerId}`);
        if (!playerRotationData) debugWarn(`Missing rotation data for player ${playerId}`);
        if (!playerActionsData) debugWarn(`Missing action data for player ${playerId}`);
        if (!playerBlockInteractionsData) debugWarn(`Missing block interaction data for player ${playerId}`);
        if (!playerBeforeBlockInteractionsData) debugWarn(`Missing before block interaction data for player ${playerId}`);
        if (!playBackEntityData) debugWarn(`Missing playback entity data for player ${playerId}`);
        if (!playerArmorWeaponsData) debugWarn(`Missing armor/weapons data for player ${playerId}`);
        if (!playerAmbientEntityData) debugWarn(`Missing Ambient Entity data for player ${playerId}`);
        if (!playerTrackedPlayerJoinTicks) debugWarn(`Missing tracked player join ticks for player ${playerId}`);
        if (!playerDamageEventData) debugWarn(`Missing player damage event data for player ${playerId}`);

        if (PlayerBlockData) replayCraftBlockDB.set(playerId + session.buildName, PlayerBlockData);
        if (playerPositionData) replayCraftPlayerPosDB.set(playerId + session.buildName, playerPositionData);
        if (playerRotationData) replayCraftPlayerRotDB.set(playerId + session.buildName, playerRotationData);
        if (playerActionsData) replayCraftPlayerActionsDB.set(playerId + session.buildName, playerActionsData);
        if (playerBlockInteractionsData) replayCraftBlockInteractionsDB.set(playerId + session.buildName, playerBlockInteractionsData);
        if (playerBeforeBlockInteractionsData) replayCraftBeforeBlockInteractionsDB.set(playerId + session.buildName, playerBeforeBlockInteractionsData);
        if (playBackEntityData) replayCraftPlaybackEntityDB.set(playerId + session.buildName, playBackEntityData);
        if (playerArmorWeaponsData) replayCraftPlayerArmorWeaponsDB.set(playerId + session.buildName, playerArmorWeaponsData);
        if (playerTrackedPlayerJoinTicks) replayCraftTrackedPlayerJoinTicksDB.set(playerId + session.buildName, playerTrackedPlayerJoinTicks);
        if (playerDamageEventData) replayCraftPlayerDamageEventsDB.set(playerId + session.buildName, playerDamageEventData);
        if (playerAmbientEntityData instanceof Map) {
            // Convert outer Map to object with entityId keys
            const objToSave: Record<string, any> = {};

            for (const [entityId, ambientData] of playerAmbientEntityData.entries()) {
                objToSave[entityId] = {
                    ...ambientData,
                    // Convert hurtTicks Map to array or object if present
                    hurtTicks: ambientData.hurtTicks instanceof Map ? Array.from(ambientData.hurtTicks.entries()) : ambientData.hurtTicks,
                };
            }

            replayCraftAmbientEntityDB.set(playerId + session.buildName, objToSave);
        } else {
            replayCraftAmbientEntityDB.set(playerId + session.buildName, playerAmbientEntityData);
        }

        debugLog(`Data saved for player: ${playerId}`);
    }

    // Filter session object before saving general settings
    const filteredSettings: Record<string, any> = {};

    const excludeKeys = new Set([
        "replayStateMachine",
        "replayBlockStateMap",
        "replayBlockInteractionAfterMap",
        "replayBlockInteractionBeforeMap",
        "replayPositionDataMap",
        "replayRotationDataMap",
        "replayActionDataMap",
        "replayEntityDataMap",
        "replayEquipmentDataMap",
        "replayAmbientEntityMap",
        "allRecordedPlayerIds",
        "trackedPlayerJoinTicks",
        "playerDamageEventsMap",
    ]);

    for (const [key, value] of Object.entries(session)) {
        if (typeof value !== "function" && !excludeKeys.has(key)) {
            filteredSettings[key] = value;
        }
    }

    // Save filtered session settings as JSON string
    replayCraftSettingsDB.set(player.id + session.buildName, JSON.stringify(filteredSettings));

    debugLog(`PlayerReplaySession variables saved for all players.`);
}

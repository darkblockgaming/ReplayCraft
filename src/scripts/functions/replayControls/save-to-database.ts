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
    replayAmbientEntityDB,
} from "../../classes/subscriptions/world-initialize";
import { PlayerReplaySession } from "../../data/replay-player-session";
import { debugLog, debugWarn } from "../../data/util/debug";

export function saveToDB(player: Player, session: PlayerReplaySession) {
    // Safety check for multiplayer array in session
    if (!Array.isArray(session.trackedPlayers) || session.trackedPlayers.length === 0) {
        debugWarn("No players found in session.trackedPlayers.");
        return;
    }

    // Save per-player data from session maps
    for (const currentPlayer of session.trackedPlayers) {
        console.log(`Saving data for player: ${currentPlayer.name} (${currentPlayer.id})`);

        const PlayerBlockData = session.replayBlockStateMap.get(currentPlayer.id);
        const playerPositionData = session.replayPositionDataMap.get(currentPlayer.id);
        const playerRotationData = session.replayRotationDataMap.get(currentPlayer.id);
        const playerActionsData = session.replayActionDataMap.get(currentPlayer.id);
        const playerBlockInteractionsData = session.replayBlockInteractionAfterMap.get(currentPlayer.id);
        const playerBeforeBlockInteractionsData = session.replayBlockInteractionBeforeMap.get(currentPlayer.id);
        const playBackEntityData = session.replayEntityDataMap.get(currentPlayer.id);
        const playerArmorWeaponsData = session.replayEquipmentDataMap.get(currentPlayer.id);
        const playerAmbientEntityData = session.replayAmbientEntityMap.get(currentPlayer.id);

        if (!PlayerBlockData) debugWarn(`Missing block data for player ${currentPlayer.id}`);
        if (!playerPositionData) debugWarn(`Missing position data for player ${currentPlayer.id}`);
        if (!playerRotationData) debugWarn(`Missing rotation data for player ${currentPlayer.id}`);
        if (!playerActionsData) debugWarn(`Missing action data for player ${currentPlayer.id}`);
        if (!playerBlockInteractionsData) debugWarn(`Missing block interaction data for player ${currentPlayer.id}`);
        if (!playerBeforeBlockInteractionsData) debugWarn(`Missing before block interaction data for player ${currentPlayer.id}`);
        if (!playBackEntityData) debugWarn(`Missing playback entity data for player ${currentPlayer.id}`);
        if (!playerArmorWeaponsData) debugWarn(`Missing armor/weapons data for player ${currentPlayer.id}`);
        if (!playerAmbientEntityData) debugWarn(`Missing Ambient Entity data for player ${currentPlayer.id}`);

        if (PlayerBlockData) replayCraftBlockDB.set(currentPlayer.id + session.buildName, PlayerBlockData);
        if (playerPositionData) replayCraftPlayerPosDB.set(currentPlayer.id + session.buildName, playerPositionData);
        if (playerRotationData) replayCraftPlayerRotDB.set(currentPlayer.id + session.buildName, playerRotationData);
        if (playerActionsData) replayCraftPlayerActionsDB.set(currentPlayer.id + session.buildName, playerActionsData);
        if (playerBlockInteractionsData) replayCraftBlockInteractionsDB.set(currentPlayer.id + session.buildName, playerBlockInteractionsData);
        if (playerBeforeBlockInteractionsData) replayCraftBeforeBlockInteractionsDB.set(currentPlayer.id + session.buildName, playerBeforeBlockInteractionsData);
        if (playBackEntityData) replayCraftPlaybackEntityDB.set(currentPlayer.id + session.buildName, playBackEntityData);
        if (playerArmorWeaponsData) replayCraftPlayerArmorWeaponsDB.set(currentPlayer.id + session.buildName, playerArmorWeaponsData);
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

            replayAmbientEntityDB.set(currentPlayer.id + session.buildName, objToSave);
        } else {
            replayAmbientEntityDB.set(currentPlayer.id + session.buildName, playerAmbientEntityData);
        }

        debugLog(`Data saved for player: ${currentPlayer.id}`);
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

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
} from "../../classes/subscriptions/world-initialize";
import { PlayerReplaySession } from "../../data/replay-player-session";

export function saveToDB(player: Player, session: PlayerReplaySession) {
    // Safety check for multiplayer array in session
    if (!Array.isArray(session.trackedPlayers) || session.trackedPlayers.length === 0) {
        console.warn("[⚠️] No players found in session.trackedPlayers.");
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

        if (!PlayerBlockData) console.warn(`[⚠️] Missing block data for player ${currentPlayer.id}`);
        if (!playerPositionData) console.warn(`[⚠️] Missing position data for player ${currentPlayer.id}`);
        if (!playerRotationData) console.warn(`[⚠️] Missing rotation data for player ${currentPlayer.id}`);
        if (!playerActionsData) console.warn(`[⚠️] Missing action data for player ${currentPlayer.id}`);
        if (!playerBlockInteractionsData) console.warn(`[⚠️] Missing block interaction data for player ${currentPlayer.id}`);
        if (!playerBeforeBlockInteractionsData) console.warn(`[⚠️] Missing before block interaction data for player ${currentPlayer.id}`);
        if (!playBackEntityData) console.warn(`[⚠️] Missing playback entity data for player ${currentPlayer.id}`);
        if (!playerArmorWeaponsData) console.warn(`[⚠️] Missing armor/weapons data for player ${currentPlayer.id}`);

        if (PlayerBlockData) replayCraftBlockDB.set(currentPlayer.id + session.buildName, PlayerBlockData);
        if (playerPositionData) replayCraftPlayerPosDB.set(currentPlayer.id + session.buildName, playerPositionData);
        if (playerRotationData) replayCraftPlayerRotDB.set(currentPlayer.id + session.buildName, playerRotationData);
        if (playerActionsData) replayCraftPlayerActionsDB.set(currentPlayer.id + session.buildName, playerActionsData);
        if (playerBlockInteractionsData) replayCraftBlockInteractionsDB.set(currentPlayer.id + session.buildName, playerBlockInteractionsData);
        if (playerBeforeBlockInteractionsData) replayCraftBeforeBlockInteractionsDB.set(currentPlayer.id + session.buildName, playerBeforeBlockInteractionsData);
        if (playBackEntityData) replayCraftPlaybackEntityDB.set(currentPlayer.id + session.buildName, playBackEntityData);
        if (playerArmorWeaponsData) replayCraftPlayerArmorWeaponsDB.set(currentPlayer.id + session.buildName, playerArmorWeaponsData);

        console.log(`[✅] Data saved for player: ${currentPlayer.id}`);
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
    ]);

    for (const [key, value] of Object.entries(session)) {
        if (typeof value !== "function" && !excludeKeys.has(key)) {
            filteredSettings[key] = value;
        }
    }

    // Save filtered session settings as JSON string
    replayCraftSettingsDB.set(player.id + session.buildName, JSON.stringify(filteredSettings));

    console.log(`[✅] PlayerReplaySession variables saved for all players.`);
}

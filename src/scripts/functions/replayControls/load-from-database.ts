import {
    replayCraftBeforeBlockInteractionsDB,
    replayCraftBlockDB,
    replayCraftBlockInteractionsDB,
    replayCraftPlaybackEntityDB,
    replayCraftPlayerActionsDB,
    replayCraftPlayerArmorWeaponsDB,
    replayCraftPlayerPosDB,
    replayCraftPlayerRotDB,
    replayCraftSettingsDB,
} from "../../classes/subscriptions/world-initialize";
import { Player, world } from "@minecraft/server";
import { replayMenuAfterLoad } from "../../ui/replay-menu-afterload";
import { createPlayerSession } from "../../data/create-session";
import { SharedVariables } from "../../data/replay-player-session";

export function loadFromDB(player: Player, buildName: string, showUI: boolean) {
    // Load raw saved session settings from DB
    const savedSettingsRaw = replayCraftSettingsDB.get(player.id + buildName);
    if (!savedSettingsRaw) {
        console.error(`[❌] Failed to restore settings for ${player.id}: No data found`);
        return;
    }

    try {
        const savedSettings = JSON.parse(savedSettingsRaw);

        // Get or create player session
        let session = SharedVariables.playerSessions.get(player.id);
        if (!session) {
            session = createPlayerSession(player.id);
            SharedVariables.playerSessions.set(player.id, session);
        }

        // Assign saved values to session, excluding functions, Maps, and state machine
        for (const [key, value] of Object.entries(savedSettings)) {
            if (
                typeof value !== "function" &&
                !(value instanceof Object && "size" in value && typeof (value as any).get === "function") && // rough Map detection
                key !== "replayStateMachine"
            ) {
                // Update session key if exists
                if (key in session) {
                    (session as any)[key] = value;
                }
            }
        }

        // Fix references to Player objects inside session arrays, e.g. dbgRecController, dbgCamAffectPlayer, multiPlayers
        const players = world.getPlayers();

        if (session.dbgRecController) {
            const actualPlayer = players.find((p) => p.id === session.dbgRecController.id);
            if (actualPlayer) session.dbgRecController = actualPlayer;
        }

        if (Array.isArray(session.dbgCamAffectPlayer) && session.dbgCamAffectPlayer.length > 0) {
            session.dbgCamAffectPlayer = session.dbgCamAffectPlayer.map((oldPlayer) => players.find((p) => p.id === oldPlayer.id)).filter(Boolean);
        }

        if (Array.isArray(session.multiPlayers) && session.multiPlayers.length > 0) {
            session.multiPlayers = session.multiPlayers.map((oldPlayer) => players.find((p) => p.id === oldPlayer.id)).filter(Boolean);
        }

        // Clear old map data for each multiplayer player in session
        session.multiPlayers.forEach((p) => {
            session.replayBDataMap.delete(p.id);
            session.replayPosDataMap.delete(p.id);
            session.replayRotDataMap.delete(p.id);
            session.replayMDataMap.delete(p.id);
            session.replayBDataBMap.delete(p.id);
            session.replayBData1Map.delete(p.id);
            session.replayODataMap.delete(p.id);
            session.replaySDataMap.delete(p.id);
        });

        // Load per-player data for each multiplayer player in session
        session.multiPlayers.forEach((p) => {
            const pidKey = p.id + buildName;

            const savedPlayerBlockData = replayCraftBlockDB.get(pidKey);
            const savedPlayerPositionData = replayCraftPlayerPosDB.get(pidKey);
            const savedPlayerRotationData = replayCraftPlayerRotDB.get(pidKey);
            const savedPlayerActionsData = replayCraftPlayerActionsDB.get(pidKey);
            const savedPlayerBlockInteractionsData = replayCraftBlockInteractionsDB.get(pidKey);
            const savedPlayerBeforeBlockInteractionsData = replayCraftBeforeBlockInteractionsDB.get(pidKey);
            const savedPlayBackEntityData = replayCraftPlaybackEntityDB.get(pidKey);
            const savedPlayerArmorWeaponsData = replayCraftPlayerArmorWeaponsDB.get(pidKey);

            if (
                !savedPlayerBlockData ||
                !savedPlayerPositionData ||
                !savedPlayerRotationData ||
                !savedPlayerActionsData ||
                !savedPlayerBlockInteractionsData ||
                !savedPlayerBeforeBlockInteractionsData ||
                !savedPlayBackEntityData ||
                !savedPlayerArmorWeaponsData
            ) {
                console.warn(`[⚠️] Missing replay data for player ${p.name} (${p.id})`);
            }

            if (savedPlayerBlockData) session.replayBDataMap.set(p.id, savedPlayerBlockData);
            if (savedPlayerPositionData) session.replayPosDataMap.set(p.id, savedPlayerPositionData);
            if (savedPlayerRotationData) session.replayRotDataMap.set(p.id, savedPlayerRotationData);
            if (savedPlayerActionsData) session.replayMDataMap.set(p.id, savedPlayerActionsData);
            if (savedPlayerBlockInteractionsData) session.replayBDataBMap.set(p.id, savedPlayerBlockInteractionsData);
            if (savedPlayerBeforeBlockInteractionsData) session.replayBData1Map.set(p.id, savedPlayerBeforeBlockInteractionsData);
            if (savedPlayBackEntityData) session.replayODataMap.set(p.id, savedPlayBackEntityData);
            if (savedPlayerArmorWeaponsData) session.replaySDataMap.set(p.id, savedPlayerArmorWeaponsData);
        });

        console.warn(`[✅] Settings restored for ${player.id}`);
    } catch (err) {
        console.error(`[❌] Failed to restore settings for ${player.id}:`, err);
    }

    if (showUI) {
        replayMenuAfterLoad(player);
    }
}

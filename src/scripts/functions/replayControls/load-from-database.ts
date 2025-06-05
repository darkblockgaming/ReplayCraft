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
import { replaySessions } from "../../data/replay-player-session";
import { debugLog, debugWarn, debugError } from "../../data/util/debug";

export function loadFromDB(player: Player, buildName: string, showUI: boolean) {
    const key = player.id + buildName;
    let savedSettingsRaw: string;

    try {
        savedSettingsRaw = replayCraftSettingsDB.get(key);
        if (!savedSettingsRaw) {
            debugError(`Failed to restore settings for ${player.id}: No data found using buildName: ${buildName}`);
            return;
        }
    } catch (err) {
        debugError(`Error retrieving settings from DB for ${player.id}:`, err);
        return;
    }

    let savedSettings: any;
    try {
        savedSettings = JSON.parse(savedSettingsRaw);
    } catch (err) {
        debugError(`Error parsing saved settings for ${player.id}:`, err);
        return;
    }

    let session = replaySessions.playerSessions.get(player.id);
    try {
        if (!session) {
            session = createPlayerSession(player.id);
            replaySessions.playerSessions.set(player.id, session);
        }

        for (const [key, value] of Object.entries(savedSettings)) {
            if (typeof value !== "function" && !(value instanceof Object && "size" in value && typeof (value as any).get === "function") && key !== "replayStateMachine") {
                if (key in session) {
                    (session as any)[key] = value;
                }
            }
        }
    } catch (err) {
        debugError(`Error setting up session for ${player.id}:`, err);
        return;
    }

    try {
        const players = world.getPlayers();

        if (session.dbgRecController) {
            const actualPlayer = players.find((p) => p.id === session.dbgRecController.id);
            if (actualPlayer) session.dbgRecController = actualPlayer;
        }

        if (Array.isArray(session.dbgCamAffectPlayer)) {
            session.dbgCamAffectPlayer = session.dbgCamAffectPlayer.map((oldP) => players.find((p) => p.id === oldP.id)).filter(Boolean);
        }

        if (Array.isArray(session.multiPlayers)) {
            session.multiPlayers = session.multiPlayers.map((oldP) => players.find((p) => p.id === oldP.id)).filter(Boolean);
        }
    } catch (err) {
        debugError(`Error resolving player references for ${player.id}:`, err);
        return;
    }

    try {
        debugLog("Session maps before clearing:");
        ["replayBlockStateMap", "replayPosDataMap", "replayRotDataMap", "replayMDataMap", "replayBDataBMap", "replayBData1Map", "replayODataMap", "replaySDataMap"].forEach((key) => {
            const val = (session as any)[key];
            debugLog(` - ${key}: ${val instanceof Map ? "Map" : typeof val}`);
        });

        session.multiPlayers.forEach((p) => {
            session.replayBlockStateMap.delete(p.id);
            session.replayPosDataMap.delete(p.id);
            session.replayRotDataMap.delete(p.id);
            session.replayMDataMap.delete(p.id);
            session.replayBDataBMap.delete(p.id);
            session.replayBData1Map.delete(p.id);
            session.replayODataMap.delete(p.id);
            session.replaySDataMap.delete(p.id);
        });
    } catch (err) {
        debugError(`Error clearing map data for ${player.id}:`, err);
        return;
    }

    try {
        session.multiPlayers.forEach((p) => {
            const pidKey = p.id + buildName;

            let savedPlayerBlockData, savedPlayerPositionData, savedPlayerRotationData, savedPlayerActionsData, savedPlayerBlockInteractionsData, savedPlayerBeforeBlockInteractionsData, savedPlayBackEntityData, savedPlayerArmorWeaponsData;

            try {
                savedPlayerBlockData = replayCraftBlockDB.get(pidKey);
                savedPlayerPositionData = replayCraftPlayerPosDB.get(pidKey);
                savedPlayerRotationData = replayCraftPlayerRotDB.get(pidKey);
                savedPlayerActionsData = replayCraftPlayerActionsDB.get(pidKey);
                savedPlayerBlockInteractionsData = replayCraftBlockInteractionsDB.get(pidKey);
                savedPlayerBeforeBlockInteractionsData = replayCraftBeforeBlockInteractionsDB.get(pidKey);
                savedPlayBackEntityData = replayCraftPlaybackEntityDB.get(pidKey);
                savedPlayerArmorWeaponsData = replayCraftPlayerArmorWeaponsDB.get(pidKey);
            } catch (innerErr) {
                debugError(`Error loading per-player DB for ${p.name} (${p.id}):`, innerErr);
                return;
            }

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
                debugWarn(`Missing replay data for player ${p.name} (${p.id})`);
            }

            debugLog(`Block data for ${p.name} (${p.id}):`, JSON.stringify(savedPlayerBlockData, null, 2));

            try {
                if (savedPlayerBlockData) session.replayBlockStateMap.set(p.id, savedPlayerBlockData);
                if (savedPlayerPositionData) session.replayPosDataMap.set(p.id, savedPlayerPositionData);
                if (savedPlayerRotationData) session.replayRotDataMap.set(p.id, savedPlayerRotationData);
                if (savedPlayerActionsData) session.replayMDataMap.set(p.id, savedPlayerActionsData);
                if (savedPlayerBlockInteractionsData) session.replayBDataBMap.set(p.id, savedPlayerBlockInteractionsData);
                if (savedPlayerBeforeBlockInteractionsData) session.replayBData1Map.set(p.id, savedPlayerBeforeBlockInteractionsData);
                if (savedPlayBackEntityData) session.replayODataMap.set(p.id, savedPlayBackEntityData);
                if (savedPlayerArmorWeaponsData) session.replaySDataMap.set(p.id, savedPlayerArmorWeaponsData);
            } catch (mapSetErr) {
                debugError(`Error assigning replay maps for ${p.name} (${p.id}):`, mapSetErr);
            }
        });
    } catch (err) {
        debugError(`Error processing multiplayer data for ${player.id}:`, err);
        return;
    }

    debugWarn(`Settings restored for ${player.id}`);

    try {
        if (showUI) replayMenuAfterLoad(player);
    } catch (err) {
        debugError(`Error showing UI for ${player.id}:`, err);
    }
}

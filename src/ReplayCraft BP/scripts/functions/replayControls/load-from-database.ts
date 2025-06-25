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
    replayAmbientEntityDB,
} from "../../classes/subscriptions/world-initialize";
import { Player, world } from "@minecraft/server";
import { replayMenuAfterLoad } from "../../ui/replay-menu-afterload";
import { createPlayerSession } from "../../data/create-session";
import { replaySessions } from "../../data/replay-player-session";
import { debugLog, debugWarn, debugError } from "../../data/util/debug";
import { AmbientEntityData } from "../../classes/types/types";

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

        if (session.replayController) {
            const actualPlayer = players.find((p) => p.id === session.replayController.id);
            if (actualPlayer) session.replayController = actualPlayer;
        }

        if (Array.isArray(session.cameraAffectedPlayers)) {
            session.cameraAffectedPlayers = session.cameraAffectedPlayers.map((oldP) => players.find((p) => p.id === oldP.id)).filter(Boolean);
        }

        if (Array.isArray(session.trackedPlayers)) {
            session.trackedPlayers = session.trackedPlayers.map((oldP) => players.find((p) => p.id === oldP.id)).filter(Boolean);
        }
    } catch (err) {
        debugError(`Error resolving player references for ${player.id}:`, err);
        return;
    }

    try {
        debugLog("Session maps before clearing:");
        [
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
        ].forEach((key) => {
            const val = (session as any)[key];
            debugLog(` - ${key}: ${val instanceof Map ? "Map" : typeof val}`);
        });

        session.trackedPlayers.forEach((p) => {
            session.replayBlockStateMap.delete(p.id);
            session.replayPositionDataMap.delete(p.id);
            session.replayRotationDataMap.delete(p.id);
            session.replayActionDataMap.delete(p.id);
            session.replayBlockInteractionAfterMap.delete(p.id);
            session.replayBlockInteractionBeforeMap.delete(p.id);
            session.replayEntityDataMap.delete(p.id);
            session.replayEquipmentDataMap.delete(p.id);
            session.replayAmbientEntityMap.delete(p.id);
        });
    } catch (err) {
        debugError(`Error clearing map data for ${player.id}:`, err);
        return;
    }

    try {
        session.trackedPlayers.forEach((p) => {
            const pidKey = p.id + buildName;

            let savedPlayerBlockData,
                savedPlayerPositionData,
                savedPlayerRotationData,
                savedPlayerActionsData,
                savedPlayerBlockInteractionsData,
                savedPlayerBeforeBlockInteractionsData,
                savedPlayBackEntityData,
                savedPlayerArmorWeaponsData,
                savedAmbientEntityData;

            try {
                savedPlayerBlockData = replayCraftBlockDB.get(pidKey);
                savedPlayerPositionData = replayCraftPlayerPosDB.get(pidKey);
                savedPlayerRotationData = replayCraftPlayerRotDB.get(pidKey);
                savedPlayerActionsData = replayCraftPlayerActionsDB.get(pidKey);
                savedPlayerBlockInteractionsData = replayCraftBlockInteractionsDB.get(pidKey);
                savedPlayerBeforeBlockInteractionsData = replayCraftBeforeBlockInteractionsDB.get(pidKey);
                savedPlayBackEntityData = replayCraftPlaybackEntityDB.get(pidKey);
                savedPlayerArmorWeaponsData = replayCraftPlayerArmorWeaponsDB.get(pidKey);
                savedAmbientEntityData = replayAmbientEntityDB.get(pidKey);
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
                !savedPlayerArmorWeaponsData ||
                !savedAmbientEntityData
            ) {
                debugWarn(`Missing replay data for player ${p.name} (${p.id})`);
            }

            debugLog(`Block data for ${p.name} (${p.id}):`, JSON.stringify(savedPlayerBlockData, null, 2));

            try {
                if (savedPlayerBlockData) session.replayBlockStateMap.set(p.id, savedPlayerBlockData);
                if (savedPlayerPositionData) session.replayPositionDataMap.set(p.id, savedPlayerPositionData);
                if (savedPlayerRotationData) session.replayRotationDataMap.set(p.id, savedPlayerRotationData);
                if (savedPlayerActionsData) session.replayActionDataMap.set(p.id, savedPlayerActionsData);
                if (savedPlayerBlockInteractionsData) session.replayBlockInteractionAfterMap.set(p.id, savedPlayerBlockInteractionsData);
                if (savedPlayerBeforeBlockInteractionsData) session.replayBlockInteractionBeforeMap.set(p.id, savedPlayerBeforeBlockInteractionsData);
                if (savedPlayBackEntityData) session.replayEntityDataMap.set(p.id, savedPlayBackEntityData);
                if (savedPlayerArmorWeaponsData) session.replayEquipmentDataMap.set(p.id, savedPlayerArmorWeaponsData);
                interface AmbientEntityDataRaw {
                    typeId: string;
                    recordedData: any;
                    spawnTick: number;
                    despawnTick: number;
                    lastSeenTick: number;
                    hurtTicks?: [number, number][] | Record<number, number>;
                }
                if (savedAmbientEntityData) {
                    try {
                        const obj = typeof savedAmbientEntityData === "string" ? JSON.parse(savedAmbientEntityData) : savedAmbientEntityData;
                        const ambientMap = new Map<string, AmbientEntityData>();

                        for (const [entityId, val] of Object.entries(obj)) {
                            const data = val as AmbientEntityDataRaw;

                            // Convert hurtTicks to Map
                            let hurtTicksMap: Map<number, number> | undefined;
                            if (Array.isArray(data.hurtTicks)) {
                                // If stored as [tick, damage][]
                                hurtTicksMap = new Map<number, number>(data.hurtTicks);
                            } else if (typeof data.hurtTicks === "object") {
                                // If stored as a plain object (Record<number, number>)
                                hurtTicksMap = new Map<number, number>(Object.entries(data.hurtTicks).map(([tick, dmg]) => [parseInt(tick), dmg as number]));
                            }

                            ambientMap.set(entityId, {
                                typeId: data.typeId,
                                recordedData: data.recordedData,
                                spawnTick: data.spawnTick,
                                despawnTick: data.despawnTick,
                                lastSeenTick: data.lastSeenTick,
                                replayEntity: undefined,
                                hurtTicks: hurtTicksMap,
                            });
                        }

                        session.replayAmbientEntityMap.set(p.id, ambientMap);
                    } catch (err) {
                        debugError(`Error loading ambient entity map for player ${p.name} (${p.id}):`, err);
                    }
                }
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

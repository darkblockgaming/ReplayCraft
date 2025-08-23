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
    replayCraftAmbientEntityDB,
    replayCraftAllRecordedPlayerIdsDB,
    replayCraftTrackedPlayerJoinTicksDB,
    replayCraftPlayerDamageEventsDB,
    replayCraftPlayerItemUseEventsDB,
} from "../../classes/subscriptions/world-initialize";
import { Player, Vector3, world } from "@minecraft/server";
import { replayMenuAfterLoad } from "../../ui/replay-menu-afterload";
import { createPlayerSession } from "../../data/create-session";
import { replaySessions } from "../../data/replay-player-session";
import { debugLog, debugWarn, debugError } from "../../data/util/debug";
import { AmbientEntityData, RecordedEntityComponent } from "../../classes/types/types";

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
        debugLog(`Session.trackedPlayers for ${player.id} before resolving: ${JSON.stringify(session.trackedPlayers.map((p) => p?.id || "undefined"))}`);
    } catch (err) {
        debugError(`Error setting up session for ${player.id}:`, err);
        return;
    }

    try {
        const players = world.getPlayers();
        debugLog(`World players (${players.length}): ${players.map((p) => `${p.name} (${p.id})`).join(", ")}`);

        if (session.replayController) {
            const actualPlayer = players.find((p) => p.id === session.replayController.id);
            if (actualPlayer) {
                session.replayController = actualPlayer;
                debugLog(`Resolved replayController to: ${actualPlayer.name}`);
            } else {
                debugWarn(`Replay controller with id ${session.replayController.id} not found`);
            }
        }

        if (Array.isArray(session.cameraAffectedPlayers)) {
            const resolved = session.cameraAffectedPlayers.map((oldP) => players.find((p) => p.id === oldP.id)).filter(Boolean);
            session.cameraAffectedPlayers = resolved;
            debugLog(`Resolved cameraAffectedPlayers: ${resolved.map((p) => p.name).join(", ")}`);
        }

        if (Array.isArray(session.trackedPlayers)) {
            const resolved = session.trackedPlayers.map((oldP) => players.find((p) => p.id === oldP.id)).filter(Boolean);
            debugLog(`Resolved trackedPlayers: ${resolved.map((p) => `${p.name} (${p.id})`).join(", ")}`);
            session.trackedPlayers = resolved;
        } else {
            debugWarn(`session.trackedPlayers is not an array for ${player.id}`);
        }

        debugLog(`Final trackedPlayers count: ${session.trackedPlayers.length}`);
    } catch (err) {
        debugError(`Error resolving player references for ${player.id}:`, err);
        return;
    }

    //reload allPLayerIds from DB
    try {
        // Load allRecordedPlayerIds array from DB (using player.id + buildName key)
        const allRecordedIdsRaw = replayCraftAllRecordedPlayerIdsDB.get(player.id + buildName);
        if (Array.isArray(allRecordedIdsRaw)) {
            session.allRecordedPlayerIds = new Set(allRecordedIdsRaw);
            debugLog(`Restored allRecordedPlayerIds for session: ${allRecordedIdsRaw.join(", ")}`);
        } else {
            debugWarn(`No valid allRecordedPlayerIds found for session.`);
            session.allRecordedPlayerIds = new Set();
        }
    } catch (err) {
        debugError(`Error restoring allRecordedPlayerIds for session:`, err);
        session.allRecordedPlayerIds = new Set();
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
            "trackedPlayerJoinTicks",
            "playerDamageEventsMap",
            "playerItemUseDataMap",
        ].forEach((key) => {
            const val = (session as any)[key];
            debugLog(` - ${key}: ${val instanceof Map ? "Map" : typeof val}`);
        });

        session.allRecordedPlayerIds.forEach((p) => {
            session.replayBlockStateMap.delete(p);
            session.replayPositionDataMap.delete(p);
            session.replayRotationDataMap.delete(p);
            session.replayActionDataMap.delete(p);
            session.replayBlockInteractionAfterMap.delete(p);
            session.replayBlockInteractionBeforeMap.delete(p);
            session.replayEntityDataMap.delete(p);
            session.replayEquipmentDataMap.delete(p);
            session.replayAmbientEntityMap.delete(p);
            session.trackedPlayerJoinTicks.delete(p);
            session.playerDamageEventsMap.delete(p);
            session.playerItemUseDataMap.delete(p);
        });
    } catch (err) {
        debugError(`Error clearing map data for ${player.id}:`, err);
        return;
    }

    try {
        session.allRecordedPlayerIds.forEach((p) => {
            const pidKey = p + buildName;

            let savedPlayerBlockData,
                savedPlayerPositionData,
                savedPlayerRotationData,
                savedPlayerActionsData,
                savedPlayerBlockInteractionsData,
                savedPlayerBeforeBlockInteractionsData,
                savedPlayBackEntityData,
                savedPlayerArmorWeaponsData,
                savedAmbientEntityData,
                savedPlayerJoinTicksData,
                savedPlayerDamageEventsData,
                savedPlayerItemUseEventData;

            try {
                savedPlayerBlockData = replayCraftBlockDB.get(pidKey);
                savedPlayerPositionData = replayCraftPlayerPosDB.get(pidKey);
                savedPlayerRotationData = replayCraftPlayerRotDB.get(pidKey);
                savedPlayerActionsData = replayCraftPlayerActionsDB.get(pidKey);
                savedPlayerBlockInteractionsData = replayCraftBlockInteractionsDB.get(pidKey);
                savedPlayerBeforeBlockInteractionsData = replayCraftBeforeBlockInteractionsDB.get(pidKey);
                savedPlayBackEntityData = replayCraftPlaybackEntityDB.get(pidKey);
                savedPlayerArmorWeaponsData = replayCraftPlayerArmorWeaponsDB.get(pidKey);
                savedAmbientEntityData = replayCraftAmbientEntityDB.get(pidKey);
                savedPlayerJoinTicksData = replayCraftTrackedPlayerJoinTicksDB.get(pidKey);
                savedPlayerDamageEventsData = replayCraftPlayerDamageEventsDB.get(pidKey);
                savedPlayerItemUseEventData = replayCraftPlayerItemUseEventsDB.get(pidKey);
            } catch (innerErr) {
                debugError(`Error loading per-player DB for (${p}):`, innerErr);
                return;
            }

            if (!savedPlayerBlockData) {
                debugWarn(`Missing savedPlayerBlockData for player (${p})`);
            }
            if (!savedPlayerPositionData) {
                debugWarn(`Missing savedPlayerPositionData for player (${p})`);
            }
            if (!savedPlayerRotationData) {
                debugWarn(`Missing savedPlayerRotationData for player (${p})`);
            }
            if (!savedPlayerActionsData) {
                debugWarn(`Missing savedPlayerActionsData for player (${p})`);
            }
            if (!savedPlayerBlockInteractionsData) {
                debugWarn(`Missing savedPlayerBlockInteractionsData for player (${p})`);
            }
            if (!savedPlayerBeforeBlockInteractionsData) {
                debugWarn(`Missing savedPlayerBeforeBlockInteractionsData for player (${p})`);
            }
            if (!savedPlayBackEntityData) {
                debugWarn(`Missing savedPlayBackEntityData for player (${p})`);
            }
            if (!savedPlayerArmorWeaponsData) {
                debugWarn(`Missing savedPlayerArmorWeaponsData for player (${p})`);
            }
            if (!savedAmbientEntityData) {
                debugWarn(`Missing savedAmbientEntityData for player (${p})`);
            }
            if (!savedPlayerJoinTicksData) {
                debugWarn(`Missing savedPlayerJoinTicksData for player (${p})`);
            }
            if (!savedPlayerDamageEventsData) {
                debugWarn(`Missing savedPlayerDamageEventsData for player (${p})`);
            }
            if (!savedPlayerItemUseEventData) {
                debugWarn(`Missing savedPlayerItemUseEventData for player (${p})`);
            }

            try {
                if (savedPlayerBlockData) session.replayBlockStateMap.set(p, savedPlayerBlockData);
                if (savedPlayerPositionData) session.replayPositionDataMap.set(p, savedPlayerPositionData);
                if (savedPlayerRotationData) session.replayRotationDataMap.set(p, savedPlayerRotationData);
                if (savedPlayerActionsData) session.replayActionDataMap.set(p, savedPlayerActionsData);
                if (savedPlayerBlockInteractionsData) session.replayBlockInteractionAfterMap.set(p, savedPlayerBlockInteractionsData);
                if (savedPlayerBeforeBlockInteractionsData) session.replayBlockInteractionBeforeMap.set(p, savedPlayerBeforeBlockInteractionsData);
                if (savedPlayBackEntityData) session.replayEntityDataMap.set(p, savedPlayBackEntityData);
                if (savedPlayerArmorWeaponsData) session.replayEquipmentDataMap.set(p, savedPlayerArmorWeaponsData);
                if (savedPlayerJoinTicksData) session.trackedPlayerJoinTicks.set(p, savedPlayerJoinTicksData);
                interface AmbientEntityDataRaw {
                    typeId: string;
                    recordedData: any;
                    spawnTick: number;
                    despawnTick: number;
                    lastSeenTick: number;
                    hurtTicks?: [number, number][] | Record<number, number>;
                    wasSpawned: boolean;
                    entityComponents?: RecordedEntityComponent[];
                    isProjectile: boolean;
                    velocity: Vector3;
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
                                entityComponents: data.entityComponents,
                                wasSpawned: data.wasSpawned,
                                isProjectile: data.isProjectile,
                                velocity: data.velocity,
                            });
                        }

                        session.replayAmbientEntityMap.set(p, ambientMap);
                    } catch (err) {
                        debugError(`Error loading ambient entity map for player (${p}):`, err);
                    }
                }
                if (savedPlayerDamageEventsData) session.playerDamageEventsMap.set(p, savedPlayerDamageEventsData);
                if (savedPlayerItemUseEventData) session.playerItemUseDataMap.set(p, savedPlayerItemUseEventData);
            } catch (mapSetErr) {
                debugError(`Error assigning replay maps for (${p}):`, mapSetErr);
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

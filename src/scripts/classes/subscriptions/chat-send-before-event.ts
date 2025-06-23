import { ChatSendBeforeEvent, Entity, EntityInventoryComponent, GameMode, ItemStack, system, VanillaEntityIdentifier, world } from "@minecraft/server";
import { setSkin } from "../../ui/settings/set-skin";
import { showDatabaseListUI } from "../../ui/debug/db-size";
import { showActiveSessionsUI } from "../../ui/debug/active-sessions";
import {
    replayAmbientEntityDB,
    replayCraftActiveSessionsDB,
    replayCraftBeforeBlockInteractionsDB,
    replayCraftBlockDB,
    replayCraftBlockInteractionsDB,
    replayCraftPlaybackEntityDB,
    replayCraftPlayerActionsDB,
    replayCraftPlayerArmorWeaponsDB,
    replayCraftPlayerPosDB,
    replayCraftPlayerRotDB,
    replayCraftSettingsDB,
    replayCraftSkinDB,
} from "./world-initialize";

import { OptimizedDatabase } from "../../data/data-hive";
import config from "../../data/util/config";
import { addCameraPoint } from "../../functions/camera/add-camera-point";
import { replaySessions } from "../../data/replay-player-session";
import { isPlayerRiding } from "../../entity/is-riding";
import { safeSet } from "../../main";

function findPlaybackEntityNear(sender: Entity): Entity | undefined {
    // Get all entities within a radius (e.g., 10 blocks)
    const nearbyEntities = sender.dimension.getEntities({
        location: sender.location,
        maxDistance: 10,
        tags: [], // Optionally filter by tags
    });

    // Find the first entity matching our playback entity identifier
    for (const entity of nearbyEntities) {
        if (entity.typeId === "dbg:replayentity_steve" && entity.isValid) {
            return entity;
        }
    }
    return undefined;
}
function giveItems(event: ChatSendBeforeEvent) {
    const { sender, message } = event;

    // Handles commands like "?rc" and its variations
    if (["?rc", "?dbgReplayCraft", "?ReplayCraft", "?replaycraft", "?RC", "?dbgreplaycraft"].includes(message)) {
        system.run(() => {
            const targetPlayerinv = sender.getComponent("inventory") as EntityInventoryComponent;
            const container = targetPlayerinv.container;
            const maxSlots = 36;

            // Find two free slots
            const freeSlots: number[] = [];
            for (let i = 0; i < maxSlots && freeSlots.length < 2; i++) {
                const item = container.getItem(i);
                if (!item?.typeId) {
                    freeSlots.push(i);
                }
            }

            if (freeSlots.length < 2) {
                sender.sendMessage(`Not enough free slots!`);
            } else {
                const item1 = new ItemStack("minecraft:stick");
                item1.nameTag = "Replay";
                container.setItem(freeSlots[0], item1);

                const item2 = new ItemStack("minecraft:stick");
                item2.nameTag = "Cinematic";
                container.setItem(freeSlots[1], item2);

                sender.sendMessage({
                    rawtext: [{ translate: "dbg.rc1.mes.thanks" }],
                });
            }
        });

        event.cancel = true;
        return;
    }

    // Opens the skin selection UI
    if (message === "?skin") {
        system.run(() => {
            setSkin(sender);
        });
        event.cancel = true;
        return;
    }
    if (message === "?activeSessions") {
        system.run(() => {
            const sessionEntries = replayCraftActiveSessionsDB.entries();

            const playerLabels: string[] = [];
            const playerIds: string[] = [];

            for (const [playerId, session] of sessionEntries) {
                // Fallback to the current player’s name if the session is missing a name
                const name = session?.playerName ?? "(unknown)";
                console.warn(`[Debug] session.playerName for ${playerId}: ${name}`);
                playerLabels.push(`${playerId} (${name})`);
                playerIds.push(playerId);
            }

            showActiveSessionsUI(sender, playerLabels, playerIds);
        });
        event.cancel = true;
        return;
    }
    if (message === "?add") {
        system.run(() => {
            let gm = sender.getGameMode();
            if (gm === GameMode.Spectator && sender.hasTag("freecam")) {
                addCameraPoint(sender);
            }
        });
        event.cancel = true;
        return;
    }
    if (config.devChatCommands === true) {
        // Opens the database stats UI
        if (message === "?dbstats") {
            system.run(() => {
                showDatabaseListUI(sender);
            });
            event.cancel = true;
            return;
        }

        if (message === "?riding") {
            system.run(() => {
                console.log(isPlayerRiding(sender));
            });
            event.cancel = true;
            return;
        }

        let playbackEntity = findPlaybackEntityNear(sender);

        if (message.startsWith("?playan")) {
            event.cancel = true;

            system.run(() => {
                const args = message.split(",");
                const subcommand = args[1]?.trim();

                // Helper to find the closest playback entity
                const findExistingPlaybackEntity = () => {
                    const nearby = sender.dimension.getEntities({
                        location: sender.location,
                        maxDistance: 8,
                        type: "dbg:replayentity_steve",
                    });
                    return nearby.find((e) => e.isValid);
                };

                // Use or find existing playback entity
                if (!playbackEntity || !playbackEntity.isValid) {
                    playbackEntity = findExistingPlaybackEntity();
                }

                // Reset command
                if (subcommand === "reset") {
                    if (playbackEntity && playbackEntity.isValid) {
                        const defaultProps = {
                            "rc:is_swimming": 0,
                            "rc:swim_amt": 0,
                            "rc:is_sleeping": 0,
                            "rc:sleep_dir": 0,
                            "rc:is_falling": 0,
                            "rc:is_climbing": 0,
                            "rc:is_sprinting": 0,
                            "rc:is_flying": 0,
                            "rc:is_gliding": 0,
                            "rc:is_riding": 0,
                        };

                        for (const [prop, value] of Object.entries(defaultProps)) {
                            safeSet(playbackEntity, prop, value);
                        }

                        playbackEntity.kill();
                        playbackEntity = undefined;
                        sender.sendMessage("Playback entity reset and removed.");
                    } else {
                        sender.sendMessage("No playback entity to reset.");
                    }
                    return;
                }

                const propName = args[1]?.trim();
                const rawValue = args[2]?.trim();

                if (!propName || rawValue === undefined) {
                    sender.sendMessage("Usage: ?playan,<prop>,<value> OR ?playan,reset");
                    return;
                }

                const value = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);

                // Spawn if none found
                if (!playbackEntity || !playbackEntity.isValid) {
                    playbackEntity = sender.dimension.spawnEntity("dbg:replayentity_steve" as VanillaEntityIdentifier, sender.location);

                    if (!playbackEntity) {
                        sender.sendMessage("Error: Failed to spawn playback entity.");
                        console.warn("Failed to spawn playback entity.");
                        return;
                    }

                    sender.sendMessage("Spawned new playback entity.");
                }

                // Special handling for auto-rotate sleep_dir from bed direction
                if (propName === "rc:sleep_dir" && rawValue === "bed") {
                    const bedBlock = sender.dimension.getBlock(playbackEntity.location);
                    if (bedBlock && bedBlock.typeId.includes("bed")) {
                        const direction = bedBlock.permutation.getState("direction");
                        const directionToRotation: Record<number, number> = {
                            0: 90,
                            1: 0,
                            2: 270,
                            3: 180,
                        };
                        const rotation = directionToRotation[direction];
                        if (rotation !== undefined) {
                            safeSet(playbackEntity, "rc:sleep_dir", rotation);
                            sender.sendMessage(`Set rc:sleep_dir = ${rotation}`);
                        } else {
                            sender.sendMessage(`Invalid bed direction: ${direction}`);
                        }
                    } else {
                        sender.sendMessage(`No bed block at playback entity's location.`);
                    }
                    return;
                }

                const fullProp = propName.startsWith("rc:") ? propName : `rc:${propName}`;

                // Bool props like rc:is_sleeping accept 1/0 → true/false
                const isBoolProp = fullProp === "rc:is_sleeping" || fullProp.startsWith("rc:is_");
                const parsedValue = isBoolProp ? rawValue === "1" || rawValue.toLowerCase() === "true" : value;

                safeSet(playbackEntity, fullProp, parsedValue);
                sender.sendMessage(`Set ${fullProp} to ${parsedValue}`);
            });
        }

        // Logs all keys and values from replayCraftBlockDB
        if (message === "?dblist") {
            system.run(() => {
                for (const [key, value] of replayAmbientEntityDB.entries()) {
                    console.log(`[${key}]`, JSON.stringify(value, null, 2));
                }
            });
            event.cancel = true;
            return;
        }

        if (message === "?map") {
            system.run(() => {
                if (!replaySessions || !replaySessions.playerSessions) {
                    console.log("No replay sessions available.");
                    return;
                }
                for (const [playerId, session] of replaySessions.playerSessions.entries()) {
                    const ambientMap = session.replayAmbientEntityMap;
                    if (!ambientMap || ambientMap.size === 0) {
                        console.log(`Player ${playerId} has no ambient entity data.`);
                        continue;
                    }
                    console.log(`Ambient entity maps tracked in session for ${playerId}:`);
                    for (const [ownerPlayerId, entityMap] of ambientMap.entries()) {
                        if (!entityMap || entityMap.size === 0) {
                            console.log(`  No entities recorded for player ${ownerPlayerId}`);
                            continue;
                        }
                        console.log(`  Entities recorded by ${ownerPlayerId}:`);
                        for (const [entityId, data] of entityMap.entries()) {
                            const despawn = data.despawnTick === null ? "still active" : `despawned at tick ${data.despawnTick}`;
                            const hurtTicks = data.hurtTicks && data.hurtTicks.size > 0 ? `hurtTicks: [${[...data.hurtTicks.entries()].map(([tick, dmg]) => `${tick}:${dmg}`).join(", ")}]` : "no hurtTicks";

                            console.log(`    Entity: ${entityId} | Type: ${data.typeId} | SpawnTick: ${data.spawnTick} | ${despawn} | ${hurtTicks}`);

                            // Show position & rotation samples (first 5 entries or every 10th tick)
                            const recordedTicks = Object.keys(data.recordedData)
                                .map((t) => parseInt(t))
                                .sort((a, b) => a - b);
                            const sampleTicks = recordedTicks.filter((tick, index) => index < 5 || tick % 10 === 0);

                            for (const tick of sampleTicks) {
                                const rec = data.recordedData[tick];
                                if (!rec) continue;
                                const pos = rec.location;
                                const rot = rec.rotation;
                                console.log(`      Tick ${tick}: Position = (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}), Rotation = (x: ${rot.x.toFixed(2)}, y: ${rot.y.toFixed(2)}`);
                            }
                        }
                    }
                }
            });
            event.cancel = true;
            return;
        }

        // Rebuilds and logs pointers for all key databases
        if (message === "?dbpointers") {
            system.run(() => {
                const allDatabases: [string, OptimizedDatabase | undefined][] = [
                    ["Block Data", replayCraftBlockDB],
                    ["Player Position", replayCraftPlayerPosDB],
                    ["Player Rotation", replayCraftPlayerRotDB],
                    ["Player Actions", replayCraftPlayerActionsDB],
                    ["Block Interactions", replayCraftBlockInteractionsDB],
                    ["Before Block Interactions", replayCraftBeforeBlockInteractionsDB],
                    ["Playback Entities", replayCraftPlaybackEntityDB],
                    ["Armor & Weapons", replayCraftPlayerArmorWeaponsDB],
                    ["Player Skins", replayCraftSkinDB],
                    ["Settings", replayCraftSettingsDB],
                ];

                allDatabases.forEach(([dbName, db]) => {
                    if (db) {
                        db.rebuildPointers();
                        console.log(`Pointers for ${dbName}:`);
                        const pointers = db["entries"]().map(([k]) => k);
                        pointers.forEach((pointer) => console.log(pointer));
                    } else {
                        console.warn(`Database '${dbName}' is not defined, skipping.`);
                    }
                });
            });
            event.cancel = true;
            return;
        }
    }
}

// Subscribe to chat commands
const beforeChatSend = () => {
    world.beforeEvents.chatSend.subscribe(giveItems);
};

export { beforeChatSend };

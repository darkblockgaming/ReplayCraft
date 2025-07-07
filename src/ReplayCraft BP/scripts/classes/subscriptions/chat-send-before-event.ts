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
import { toggle } from "../../ui/debug/debug-box";

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
    if (message === "?debug") {
        system.run(() => {
            toggle(event.sender);
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

        if (message === "?entity") {
            system.run(() => {
                const nearbyEntities = sender.dimension.getEntities({
                    location: sender.location,
                    maxDistance: 64,
                });

                let found = 0;
                for (const entity of nearbyEntities) {
                    if (entity.hasTag(`replay:${sender.id}`)) {
                        found++;
                        console.log(`[Replay Entity] Type: ${entity.typeId}, Location: ${JSON.stringify(entity.location)}, ID Tag: replay:${sender.id}`);
                    }
                }

                if (found === 0) {
                    console.log(`[Replay Entity] No entities found with tag replay:${sender.id}`);
                } else {
                    console.log(`[Replay Entity] Total found: ${found}`);
                }
            });

            event.cancel = true;
            return;
        }

        let playbackEntity = findPlaybackEntityNear(sender);

        if (message.startsWith("?playan")) {
            event.cancel = true;

            system.run(() => {
                const args = message.split(",");
                const prop = args[1]?.trim();
                const rawValue = args[2]?.trim();

                if (!prop || rawValue === undefined) {
                    sender.sendMessage("Usage: ?playan,<prop>,<value>");
                    return;
                }

                const fullProp = prop.startsWith("rc:") ? prop : `rc:${prop}`;
                const isBoolProp = fullProp.startsWith("rc:is_");

                const value = isBoolProp ? rawValue === "1" || rawValue.toLowerCase() === "true" : isNaN(Number(rawValue)) ? rawValue : Number(rawValue);

                if (!playbackEntity || !playbackEntity.isValid) {
                    playbackEntity = sender.dimension.spawnEntity("dbg:replayentity_steve" as VanillaEntityIdentifier, sender.location);
                    if (!playbackEntity) {
                        sender.sendMessage("Failed to spawn playback entity.");
                        return;
                    }
                    sender.sendMessage("Spawned new playback entity.");
                }

                safeSet(playbackEntity, fullProp, value);
                sender.sendMessage(`Set ${fullProp} to ${value}`);
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
                let session = replaySessions.playerSessions.get(sender.id);
                if (!session) {
                    sender.sendMessage("§cNo recording session found.");
                    return;
                }

                const map = session.replayBlockInteractionAfterMap;
                const entries = Array.from(map.entries()).map(([playerId, data]) => {
                    return { playerId, data };
                });

                console.log(JSON.stringify(entries, null, 2));
                sender.sendMessage("§aInteraction map printed to console.");
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

import { PlayerInteractWithBlockAfterEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { saveDoorPartsB } from "../../functions/door-parts-interact-with-block-after-event";
import { getOffsetFromBlockFace } from "../../data/util/block-face-to-offset";
import { debugLog, debugWarn } from "../../data/util/debug";
import config from "../../data/util/config";

/*function recordBlocks(event: PlayerInteractWithBlockAfterEvent) {
    const { player, block, itemStack, blockFace } = event;

    const session = replaySessions.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;
    if (!session.trackedPlayers.includes(player)) return;
    if (!itemStack) return;

    const isBucket = itemStack.typeId === "minecraft:water_bucket" || itemStack.typeId === "minecraft:powder_snow_bucket" || itemStack.typeId === "minecraft:lava_bucket";

    if (isBucket) {
        const normalizedFace = blockFace.toLowerCase();
        const offset = getOffsetFromBlockFace(normalizedFace);
        const placePos = {
            x: block.location.x + offset.x,
            y: block.location.y + offset.y,
            z: block.location.z + offset.z,
        };
        const placedBlock = block.dimension.getBlock(placePos);

        debugLog(`[DEBUG] Player ${player.name} placed block at: x=${placePos.x}, y=${placePos.y}, z=${placePos.z}`);
        debugLog(`[DEBUG] blockFace: ${blockFace}, normalized: ${normalizedFace}, offset: x=${offset.x}, y=${offset.y}, z=${offset.z}`);

        debugLog(`[DEBUG] Block at placePos: ${placedBlock.typeId}`);

        const playerData = session.replayBlockStateMap.get(player.id);
        if (!playerData) return;

        switch (itemStack.typeId) {
            case "minecraft:water_bucket":
                playerData.blockStateChanges[session.recordingEndTick] = {
                    location: placePos,
                    typeId: "minecraft:flowing_water",
                    states: {},
                };
                break;
            case "minecraft:lava_bucket":
                playerData.blockStateChanges[session.recordingEndTick] = {
                    location: placePos,
                    typeId: "minecraft:flowing_lava",
                    states: {},
                };
                break;
            case "minecraft:powder_snow_bucket":
                playerData.blockStateChanges[session.recordingEndTick] = {
                    location: placePos,
                    typeId: "minecraft:powder_snow",
                    states: {},
                };
                break;
            default:
                // Just in case
                return;
        }
        return;
    }

    if (session.twoPartBlocks.includes(block.type.id)) {
        saveDoorPartsB(block, player);
    } else {
        const playerData = session.replayBlockInteractionAfterMap.get(player.id);
        if (!playerData) return;

        playerData.blockSateAfterInteractions[session.recordingEndTick] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
            itemStack: itemStack,
        };
    }
}**/

function recordBlocks(event: PlayerInteractWithBlockAfterEvent) {
    const { player, block, itemStack, blockFace } = event;

    // Case 1: Player has their own session
    let session = replaySessions.playerSessions.get(player.id);
    if (session) {
        if (session.replayStateMachine.state !== "recPending") {
            if (config.debugPlayerInteractWithBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] ${player.name} has a session but it's not in recPending (state: ${session.replayStateMachine.state})`);
            }
            return;
        }

        if (!session.trackedPlayers.includes(player)) {
            if (config.debugPlayerInteractWithBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] ${player.name} is not in their own trackedPlayers list`);
            }
            return;
        }
    } else {
        // Case 2: Player is a tracked guest in another recorder's session
        session = [...replaySessions.playerSessions.values()].find((s) => s.replayStateMachine.state === "recPending" && s.trackedPlayers.some((p) => p.id === player.id));

        if (!session) {
            if (config.debugPlayerInteractWithBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] No session found tracking guest ${player.name} (${player.id})`);
            }

            return;
        }
    }

    const isBucket = itemStack?.typeId === "minecraft:water_bucket" || itemStack?.typeId === "minecraft:powder_snow_bucket" || itemStack?.typeId === "minecraft:lava_bucket";

    if (isBucket) {
        const normalizedFace = blockFace.toLowerCase();
        const offset = getOffsetFromBlockFace(normalizedFace);
        const placePos = {
            x: block.location.x + offset.x,
            y: block.location.y + offset.y,
            z: block.location.z + offset.z,
        };
        const placedBlock = block.dimension.getBlock(placePos);
        if (config.debugPlayerInteractWithBlockAfterEvent === true) {
            debugLog(`[DEBUG] Player ${player.name} placed block at: x=${placePos.x}, y=${placePos.y}, z=${placePos.z}`);
            debugLog(`[DEBUG] blockFace: ${blockFace}, normalized: ${normalizedFace}, offset: x=${offset.x}, y=${offset.y}, z=${offset.z}`);
            debugLog(`[DEBUG] Block at placePos: ${placedBlock.typeId}`);
        }
        let playerData = session.replayBlockStateMap.get(player.id);
        if (!playerData) {
            playerData = { blockStateChanges: {} };
            session.replayBlockStateMap.set(player.id, playerData);
            if (config.debugPlayerInteractWithBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] Initialized replayBlockStateMap for guest ${player.name}`);
            }
        }

        switch (itemStack.typeId) {
            case "minecraft:water_bucket":
                playerData.blockStateChanges[session.recordingEndTick] = {
                    location: placePos,
                    typeId: "minecraft:flowing_water",
                    states: {},
                };
                break;
            case "minecraft:lava_bucket":
                playerData.blockStateChanges[session.recordingEndTick] = {
                    location: placePos,
                    typeId: "minecraft:flowing_lava",
                    states: {},
                };
                break;
            case "minecraft:powder_snow_bucket":
                playerData.blockStateChanges[session.recordingEndTick] = {
                    location: placePos,
                    typeId: "minecraft:powder_snow",
                    states: {},
                };
                break;
            default:
                // Just in case
                return;
        }
        return;
    }

    if (session.twoPartBlocks.includes(block.type.id)) {
        if (config.debugPlayerInteractWithBlockAfterEvent === true) {
            debugLog(`calling saveDoorPartsB `);
        }

        saveDoorPartsB(block, player, session);
    } else {
        let playerData = session.replayBlockInteractionAfterMap.get(player.id);
        if (!playerData) {
            playerData = { blockSateAfterInteractions: {} };
            session.replayBlockInteractionAfterMap.set(player.id, playerData);
            if (config.debugPlayerInteractWithBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] Initialized replayBlockStateMap for guest ${player.name}`);
            }
        }

        playerData.blockSateAfterInteractions[session.recordingEndTick] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
            itemStack: itemStack,
        };
    }
}

const replaycraftInteractWithBlockAfterEvent = () => {
    world.afterEvents.playerInteractWithBlock.subscribe(recordBlocks);
};

export { replaycraftInteractWithBlockAfterEvent };

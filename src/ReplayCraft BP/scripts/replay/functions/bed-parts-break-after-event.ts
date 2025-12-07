import { Block, Player, Vector3 } from "@minecraft/server";
import { PlayerReplaySession } from "../data/replay-player-session";
import { BlockData } from "../classes/types/types";
import { debugWarn } from "../data/util/debug";

export function saveBedParts(block: Block, player: Player, session: PlayerReplaySession) {
    const isHead = block.permutation.getState("head_piece_bit"); // true if head, false if foot
    const direction = block.permutation.getState("direction"); // 'north = 2', 'south = 0', 'east = 3', 'west = 1'

    // Ensure the location is in Vector3 format
    let otherPartLocation: Vector3 = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z,
    };

    // Adjust the other part location based on the head piece and direction
    if (isHead) {
        if (direction === 2) {
            otherPartLocation = { x: block.location.x, y: block.location.y, z: block.location.z + 1 }; // North
        } else if (direction === 0) {
            otherPartLocation = { x: block.location.x, y: block.location.y, z: block.location.z - 1 }; // South
        } else if (direction === 3) {
            otherPartLocation = { x: block.location.x - 1, y: block.location.y, z: block.location.z }; // West
        } else if (direction === 1) {
            otherPartLocation = { x: block.location.x + 1, y: block.location.y, z: block.location.z }; // East
        }
    } else {
        if (direction === 2) {
            otherPartLocation = { x: block.location.x, y: block.location.y, z: block.location.z - 1 }; // North
        } else if (direction === 0) {
            otherPartLocation = { x: block.location.x, y: block.location.y, z: block.location.z + 1 }; // South
        } else if (direction === 3) {
            otherPartLocation = { x: block.location.x + 1, y: block.location.y, z: block.location.z }; // West
        } else if (direction === 1) {
            otherPartLocation = { x: block.location.x - 1, y: block.location.y, z: block.location.z }; // East
        }
    }

    const otherPartBlock = block.dimension.getBlock(otherPartLocation);
    if (otherPartBlock && otherPartBlock.typeId !== "minecraft:air") {
        const otherPart: BlockData = {
            location: otherPartLocation,
            typeId: otherPartBlock.typeId,
            states: otherPartBlock.permutation.getAllStates(),
        };

        let playerData = session.replayBlockStateMap.get(player.id);
        if (!playerData) {
            playerData = { blockStateChanges: {} };
            session.replayBlockStateMap.set(player.id, playerData);
            debugWarn(`[ReplayCraft] Initialized replayBlockStateMap for guest ${player.name} (from saveDoorParts)`);
        }
        playerData.blockStateChanges[session.recordingEndTick] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
            thisPart: {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates(),
            },
            otherPart: otherPart,
        };
    }
}

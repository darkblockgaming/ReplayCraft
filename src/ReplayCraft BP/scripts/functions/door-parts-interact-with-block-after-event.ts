import { Block, Player } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session";

export function saveDoorPartsB(block: Block, player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        console.warn(`[ReplayCraft DEBUG] No replay session found for player ${player.name} (${player.id})`);
        return;
    }

    const isUpper = block.permutation.getState("upper_block_bit");

    let lowerBlock: Block;
    let upperBlock: Block;

    if (isUpper) {
        // The clicked block is upper half
        upperBlock = block;
        const lowerPartLocation = {
            x: block.location.x,
            y: block.location.y - 1, // one below
            z: block.location.z,
        };
        lowerBlock = block.dimension.getBlock(lowerPartLocation);
    } else {
        // The clicked block is lower half
        lowerBlock = block;
        const upperPartLocation = {
            x: block.location.x,
            y: block.location.y + 1, // one above
            z: block.location.z,
        };
        upperBlock = block.dimension.getBlock(upperPartLocation);
    }

    const lowerPart = {
        location: lowerBlock.location,
        typeId: lowerBlock.typeId,
        states: lowerBlock.permutation.getAllStates(),
    };

    const upperPart = {
        location: upperBlock.location,
        typeId: upperBlock.typeId,
        states: upperBlock.permutation.getAllStates(),
    };

    let playerData = session.replayBlockInteractionAfterMap.get(player.id);
    if (!playerData) {
        playerData = { blockSateAfterInteractions: {} };
        session.replayBlockInteractionAfterMap.set(player.id, playerData);
        console.log(`[ReplayCraft DEBUG] Initialized replayBlockInteractionAfterMap for player ${player.name}`);
    }

    playerData.blockSateAfterInteractions[session.recordingEndTick] = {
        lowerPart,
        upperPart,
    };

    console.log(`[ReplayCraft DEBUG] Recorded door parts for player ${player.name} at tick ${session.recordingEndTick}`);
}

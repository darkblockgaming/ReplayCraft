import { Block, Player } from "@minecraft/server";
import { PlayerReplaySession } from "../data/replay-player-session";

export function saveDoorParts1(block: Block, player: Player, session: PlayerReplaySession) {
    const isUpper = block.permutation.getState("upper_block_bit");
    if (!isUpper) {
        const lowerPart = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };

        const upperPartLocation = {
            x: block.location.x,
            y: block.location.y + 1,
            z: block.location.z,
        };

        const upperPartBlock = block.dimension.getBlock(upperPartLocation);
        const upperPart = {
            location: upperPartLocation,
            typeId: upperPartBlock.typeId,
            states: upperPartBlock.permutation.getAllStates(),
        };

        let playerData = session.replayBlockInteractionBeforeMap.get(player.id);
        if (!playerData) {
            playerData = { blockStateBeforeInteractions: {} };
            session.replayBlockInteractionBeforeMap.set(player.id, playerData);
            console.warn(`[ReplayCraft] Initialized replayBlockInteractionBeforeMap for ${player.name}`);
        }

        playerData.blockStateBeforeInteractions[session.recordingEndTick] = {
            lowerPart,
            upperPart,
        };
    }
}

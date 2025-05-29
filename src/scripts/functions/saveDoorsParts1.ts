import { Block, Player } from "@minecraft/server";
import { SharedVariables } from "../data/replay-player-session";

export function saveDoorParts1(block: Block, player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
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
        const playerData = session.replayBData1Map.get(player.id);
        playerData.dbgBlockData1[session.dbgRecTime] = {
            lowerPart,
            upperPart,
        };
    }
}

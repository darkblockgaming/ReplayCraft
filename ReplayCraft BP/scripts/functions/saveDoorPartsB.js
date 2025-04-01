import { SharedVariables } from "../main";

export function saveDoorPartsB(block, player) {
    const isUpper = block.permutation.getState("upper_block_bit");
    if (!isUpper) {
        const lowerPart = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates()
        };
        const upperPartLocation = {
            x: block.location.x,
            y: block.location.y + 1,
            z: block.location.z
        };
        const upperPartBlock = block.dimension.getBlock(upperPartLocation);
        const upperPart = {
            location: upperPartLocation,
            typeId: upperPartBlock.typeId,
            states: upperPartBlock.permutation.getAllStates()
        };
        const playerData = SharedVariables.replayBDataBMap.get(player.id);
        playerData.dbgBlockDataB[SharedVariables.dbgRecTime] = {
            lowerPart,
            upperPart
        };
    }
}
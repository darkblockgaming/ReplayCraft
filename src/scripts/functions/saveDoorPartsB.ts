import { Block, Player } from "@minecraft/server";
import { SharedVariables } from "../main";

export function saveDoorPartsB(block: Block, player: Player) {
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

    const playerData = SharedVariables.replayBDataBMap.get(player.id);
    playerData.dbgBlockDataB[SharedVariables.dbgRecTime] = {
        lowerPart,
        upperPart,
    };
}

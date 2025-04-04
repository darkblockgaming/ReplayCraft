import { Block, Player } from "@minecraft/server";
import { SharedVariables } from "../main";
export function saveDoorParts(block: Block, player: Player) { //Calculate Orher Part Of Doors/Grass 
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

        const playerData = SharedVariables.replayBDataMap.get(player.id);
        playerData.dbgBlockData[SharedVariables.dbgRecTime] = {
            location: lowerPart.location,
            typeId: lowerPart.typeId,
            states: lowerPart.states,
            thisPart: {
                location: lowerPart.location,
                typeId: lowerPart.typeId,
                states: lowerPart.states
            },
            lowerPart,
            upperPart
        };
    }
}
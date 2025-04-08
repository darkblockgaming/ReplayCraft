import { SharedVariables } from "../main";
import { Block, Player, Vector3 } from "@minecraft/server";

export function saveDoorParts(block: Block, player: Player) {
    // Check if the block is the lower part of the door
    const isUpper = block.permutation.getState("upper_block_bit");
    if (!isUpper) {
        // Define lower part
        const lowerPart = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };

        // Define upper part
        const upperPartLocation: Vector3 = {
            x: block.location.x,
            y: block.location.y + 1,
            z: block.location.z,
        };
        const upperPartBlock = block.dimension.getBlock(upperPartLocation);
        
        // Ensure upperPartBlock exists before accessing properties
        const upperPart = upperPartBlock
            ? {
                  location: upperPartLocation,
                  typeId: upperPartBlock.typeId,
                  states: upperPartBlock.permutation.getAllStates(),
              }
            : null;

        if (!upperPart) return; // Safety check in case the block doesn't exist

        // Get player data
        const playerData = SharedVariables.replayBDataMap.get(player.id);
        
        // Save with a top-level structure
        playerData.dbgBlockData[SharedVariables.dbgRecTime] = {
            location: lowerPart.location, // Use lowerPart location as base
            typeId: lowerPart.typeId, // Use lowerPart typeId as base
            states: lowerPart.states, // Use lowerPart states as base
            lowerPart,
            upperPart,
        };
    }
}

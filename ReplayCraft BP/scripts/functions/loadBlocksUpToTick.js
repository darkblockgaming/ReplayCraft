import { BlockPermutation, world } from "@minecraft/server";
import { SharedVariables } from "../main";
import { isChunkLoaded } from "./isChunkLoaded";
import { waitForChunkLoad } from "./waitForChunkLoad";

export async function loadBlocksUpToTick(targetTick, player) {
    const playerData = SharedVariables.replayBDataMap.get(player.id);
    if (!playerData) {
        console.warn(`No block replay data for player ${player.name}`);
        return;
    }

    for (let tick = 0; tick <= targetTick; tick++) {
        const blockData = playerData.dbgBlockData[tick];
        if (!blockData) continue;

        // Function to safely get and modify a block
        async function setBlock(location, typeId, states) {
            if (!isChunkLoaded(location, player)) {
                console.warn(`Chunk not loaded for block at ${location.x}, ${location.y}, ${location.z}. Teleporting player...`);
                
                // Attempt to teleport player near the chunk
                const success = player.tryTeleport({ x: location.x, y: location.y + 2, z: location.z }, { checkForBlocks: false });
                
                if (success) {
                    await waitForChunkLoad(location, player); // Wait for chunk to load
                } else {
                    console.error(`Failed to teleport ${player.name} to load chunk at ${location.x}, ${location.y}, ${location.z}`);
                    return;
                }
            }
            

            const block = world.getDimension(SharedVariables.dbgRecController.dimension.id).getBlock(location);
            if (!block) {
                console.error(`Failed to get block at ${location.x}, ${location.y}, ${location.z}`);
                return;
            }

            block.setPermutation(BlockPermutation.resolve(typeId, states));
        }

        // Handle different block parts safely
        if (blockData.lowerPart && blockData.upperPart) {
            await setBlock(blockData.lowerPart.location, blockData.lowerPart.typeId, blockData.lowerPart.states);
            await setBlock(blockData.upperPart.location, blockData.upperPart.typeId, blockData.upperPart.states);
        } else if (blockData.thisPart && blockData.otherPart) {
            await setBlock(blockData.thisPart.location, blockData.thisPart.typeId, blockData.thisPart.states);
            await setBlock(blockData.otherPart.location, blockData.otherPart.typeId, blockData.otherPart.states);
        } else if (blockData.location) {
            await setBlock(blockData.location, blockData.typeId, blockData.states);
        }
    }
}
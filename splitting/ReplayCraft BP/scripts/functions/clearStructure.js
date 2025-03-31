import { SharedVariables } from "../main";

//@ts-check
export async function clearStructure(player) {
    const playerData = SharedVariables.replayBData1Map.get(player.id);
    if (!playerData || !playerData.dbgBlockData1) return;

    const ticks = Object.keys(playerData.dbgBlockData1).map(Number).sort((a, b) => b - a);
    const visitedChunks = new Set();
    const CHUNK_RADIUS = 4 * 16; // 4 chunks * 16 blocks per chunk = 64 blocks

    // Get the recording start position
    const recordingStartPos = SharedVariables.SharedVariables.replayPosDataMap.get(player.id)?.dbgRecPos?.[0];
    // Store original position before teleporting
    const originalPos = player.location; 
    if (!recordingStartPos) {
        player.onScreenDisplay.setActionBar(`Error: Recording start position not found.`);
        return;
    }

    let playerTeleported = false; // Track if the player was teleported

    for (const tick of ticks) {
        const data = playerData.dbgBlockData1[tick];
        const blockPositions = [];

        if (data.lowerPart) {
            blockPositions.push(data.lowerPart.location, data.upperPart.location);
        } else if (data.thisPart) {
            blockPositions.push(data.thisPart.location, data.otherPart.location);
        } else {
            blockPositions.push(data.location);
        }

        for (const blockPos of blockPositions) {
            const chunkKey = `${Math.floor(blockPos.x / 16)},${Math.floor(blockPos.z / 16)}`;

            // Calculate if the player is within the 4-chunk radius of the target block
            const dx = player.location.x - blockPos.x;
            const dz = player.location.z - blockPos.z;
            const distanceSquared = dx * dx + dz * dz;
            const isFarAway = distanceSquared > CHUNK_RADIUS * CHUNK_RADIUS;

            // Only load chunk if the player is far away
            if (!visitedChunks.has(chunkKey) && isFarAway) {
                visitedChunks.add(chunkKey);

                // Attempt to teleport player to load chunk
                let success = false;
                if (isFarAway) {
                    success = player.tryTeleport(blockPos, { checkForBlocks: false });

                    // If teleport fails, try adjusting Y slightly to avoid collision
                    if (!success) {
                        success = player.tryTeleport({ x: blockPos.x, y: blockPos.y + 2, z: blockPos.z }, { checkForBlocks: false });
                    }

                    // Wait for chunk to load before modifying blocks
                    if (success) {
                        await new Promise(resolve => system.runTimeout(resolve, 5)); // Wait for ~5 game ticks
                        playerTeleported = true; // Mark player as teleported
                    }
                }
            }

            // Ensure the chunk is loaded
            const block = player.dimension.getBlock(blockPos);
            if (block) {
                // Log if the block is found
                //console.log(`Clearing block at: ${blockPos.x}, ${blockPos.y}, ${blockPos.z}`);
                
                // Clear the block
                block.setPermutation(BlockPermutation.resolve(data.typeId, data.states));
            } else {
                console.log(`Block not found at: ${blockPos.x}, ${blockPos.y}, ${blockPos.z}`);
            }
        }
    }

    // If the player was teleported, return them to the recording start position
    if (playerTeleported) {
        player.tryTeleport(originalPos, { checkForBlocks: false });
        //player.onScreenDisplay.setActionBar(`You have been teleported back to the start of the recording.`);
    }
}
import { BlockPermutation, Player, system, Vector3 } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session";
import { BlockInteractionEntry, twoPartBlocks } from "../classes/types/types";

// Helper to compare two locations
function positionsEqual(a: Vector3, b: Vector3): boolean {
    return a.x === b.x && a.y === b.y && a.z === b.z;
}

// Helper to select the correct part of a multi-block structure
function getBlockPartData(data: any, blockPos: Vector3) {
    switch (true) {
        case !!data.lowerPart && positionsEqual(blockPos, data.lowerPart.location):
            return data.lowerPart;

        case !!data.upperPart && positionsEqual(blockPos, data.upperPart.location):
            return data.upperPart;

        case !!data.thisPart && positionsEqual(blockPos, data.thisPart.location):
            return data.thisPart;

        case !!data.otherPart && positionsEqual(blockPos, data.otherPart.location):
            return data.otherPart;

        case !!data.typeId:
            return data;

        default:
            return null;
    }
}

export async function clearStructure(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);

    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    const playerData = session.replayBlockInteractionBeforeMap.get(player.id);
    if (!playerData || !playerData.blockStateBeforeInteractions) return;

    const ticks = Object.keys(playerData.blockStateBeforeInteractions)
        .map(Number)
        .sort((a, b) => b - a);
    const visitedChunks = new Set();
    const CHUNK_RADIUS = 4 * 16; // 4 chunks * 16 blocks per chunk = 64 blocks

    // Get the recording start position
    const recordingStartPos = session.replayPositionDataMap.get(player.id)?.recordedPositions?.[0];
    // Store original position before teleporting
    const originalPos = player.location;
    if (!recordingStartPos) {
        player.sendMessage(`Error: Recording start position not found.`);
        return;
    }

    let playerTeleported = false; // Track if the player was teleported

    for (const tick of ticks) {
        const data = playerData.blockStateBeforeInteractions[tick];
        const blockPositions: { x: number; y: number; z: number }[] = [];

        // Type guard to check if data is twoPartBlocks
        const isTwoPartBlocks = (obj: BlockInteractionEntry): obj is twoPartBlocks => {
            return obj !== null && typeof obj === "object" && "lowerPart" in obj && "upperPart" in obj;
        };

        if (isTwoPartBlocks(data)) {
            // twoPartBlocks: push both lowerPart and upperPart locations
            blockPositions.push(data.lowerPart.location, data.upperPart.location);
        } else if ("location" in data && data.location) {
            // BlockData: push its location
            blockPositions.push(data.location);
        } else {
            // Unexpected structure
            console.error("Invalid block data:", JSON.stringify(data, null, 2));
            continue;
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
                        await new Promise<void>((resolve) => system.runTimeout(() => resolve(), 5)); // Wait for ~5 game ticks
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
                // Helper function to get the part data (returns a BlockData or undefined)
                const partData = getBlockPartData(data, block.location);
                if (partData?.typeId) {
                    try {
                        const permutation = BlockPermutation.resolve(partData.typeId, partData.states || {});
                        block.setPermutation(permutation);
                    } catch (e) {
                        console.error(`BlockPermutation failed for ${JSON.stringify(partData, null, 2)}: ${e}`);
                    }
                } else {
                    console.error("Invalid block data:", JSON.stringify(data, null, 2));
                }
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

    /**
     * We can re enable the following hud elements
     * PaperDoll = 0
     * Armor = 1
     * ToolTips = 2
     * TouchControls = 3
     * Crosshair = 4
     * Hotbar = 5
     * Health = 6
     * ProgressBar = 7
     * Hunger = 8
     * AirBubbles = 9
     * HorseHealth = 10
     * StatusEffects = 11
     * ItemText = 12
     */
    if (session.hideHUD === true) {
        player.onScreenDisplay.setHudVisibility(1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }
}

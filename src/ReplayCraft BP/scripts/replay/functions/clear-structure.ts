import { BlockPermutation, Player, system, Vector3 } from "@minecraft/server";
import { PlayerReplaySession } from "../data/replay-player-session";
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

export async function clearStructure(player: Player, session: PlayerReplaySession) {
    const CHUNK_RADIUS = 4 * 16; // 4 chunks * 16 blocks per chunk = 64 blocks
    const visitedChunks = new Set<string>();
    const originalPos = player.location;
    //check if this player is the controller

    const isController = player === session.replayController;
    let playerTeleported = false;

    for (const playerId of session.allRecordedPlayerIds) {
        const playerData = session.replayBlockInteractionBeforeMap.get(playerId);
        if (!playerData || !playerData.blockStateBeforeInteractions) continue;

        const ticks = Object.keys(playerData.blockStateBeforeInteractions)
            .map(Number)
            .sort((a, b) => b - a);

        const recordingStartPos = session.replayPositionDataMap.get(playerId)?.recordedPositions?.[0];
        if (!recordingStartPos) {
            console.warn(`Recording start position not found for playerId: ${playerId}`);
            continue;
        }
        session.replayController;

        for (const tick of ticks) {
            const data = playerData.blockStateBeforeInteractions[tick];
            const blockPositions: Vector3[] = [];

            const isTwoPartBlocks = (obj: BlockInteractionEntry): obj is twoPartBlocks => {
                return obj !== null && typeof obj === "object" && "lowerPart" in obj && "upperPart" in obj;
            };

            if (isTwoPartBlocks(data)) {
                blockPositions.push(data.lowerPart.location, data.upperPart.location);
            } else if ("location" in data && data.location) {
                blockPositions.push(data.location);
            } else {
                console.error("Invalid block data:", JSON.stringify(data, null, 2));
                continue;
            }

            for (const blockPos of blockPositions) {
                const chunkKey = `${Math.floor(blockPos.x / 16)},${Math.floor(blockPos.z / 16)}`;

                const dx = player.location.x - blockPos.x;
                const dz = player.location.z - blockPos.z;
                const distanceSquared = dx * dx + dz * dz;
                const isFarAway = distanceSquared > CHUNK_RADIUS * CHUNK_RADIUS;

                if (isController && !visitedChunks.has(chunkKey) && isFarAway) {
                    visitedChunks.add(chunkKey);

                    let success = player.tryTeleport(blockPos, { checkForBlocks: false });

                    if (!success) {
                        success = player.tryTeleport({ x: blockPos.x, y: blockPos.y + 2, z: blockPos.z }, { checkForBlocks: false });
                    }

                    if (success) {
                        await new Promise<void>((resolve) => system.runTimeout(() => resolve(), 5));
                        playerTeleported = true;
                    }
                }

                const block = player.dimension.getBlock(blockPos);
                if (block) {
                    const partData = getBlockPartData(data, block.location);
                    if (partData?.typeId) {
                        try {
                            const permutation = BlockPermutation.resolve(partData.typeId, partData.states || {});
                            block.setPermutation(permutation);
                        } catch (e) {
                            console.error(`BlockPermutation failed for ${JSON.stringify(partData, null, 2)}: ${e}`);
                        }
                    } else {
                        console.error("Invalid block part data:", JSON.stringify(data, null, 2));
                    }
                } else {
                    console.log(`Block not found at: ${blockPos.x}, ${blockPos.y}, ${blockPos.z}`);
                }
            }
        }
    }

    // Return player to original position
    if (isController && playerTeleported) {
        player.tryTeleport(originalPos, { checkForBlocks: false });
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

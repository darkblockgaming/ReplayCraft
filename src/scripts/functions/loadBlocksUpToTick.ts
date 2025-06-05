import { BlockPermutation, Player, Vector3, world, Dimension } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session";
import { isChunkLoaded } from "./isChunkLoaded";
import { waitForChunkLoad } from "./waitForChunkLoad";
import { PlayerBlockData } from "..//classes/types/types"; // Adjust the import path as necessary

type BlockState = Record<string, any>; // Define block states as a record of key-value pairs

type BlockData = {
    location?: Vector3;
    typeId: string;
    states: BlockState;
    lowerPart?: { location: Vector3; typeId: string; states: BlockState };
    upperPart?: { location: Vector3; typeId: string; states: BlockState };
    thisPart?: { location: Vector3; typeId: string; states: BlockState };
    otherPart?: { location: Vector3; typeId: string; states: BlockState };
};

export async function loadBlocksUpToTick(targetTick: number, player: Player): Promise<void> {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        console.warn(`No replay session found for player ${player.name}`);
        return;
    }
    const playerData: PlayerBlockData | undefined = session.replayBlockStateMap.get(player.id);
    if (!playerData) {
        console.warn(`No block replay data for player ${player.name}`);
        return;
    }

    for (let tick = 0; tick <= targetTick; tick++) {
        const blockData: BlockData | undefined = playerData.blockStateChanges[tick];
        if (!blockData) continue;

        async function setBlock(location: Vector3, typeId: string, states: BlockState): Promise<void> {
            if (!isChunkLoaded(location, player)) {
                console.warn(`Chunk not loaded for block at ${location.x}, ${location.y}, ${location.z}. Teleporting player...`);

                const success = player.tryTeleport({ x: location.x, y: location.y + 2, z: location.z }, { checkForBlocks: false });

                if (success) {
                    await waitForChunkLoad(location, player);
                } else {
                    console.error(`Failed to teleport ${player.name} to load chunk at ${location.x}, ${location.y}, ${location.z}`);
                    return;
                }
            }

            const dimension: Dimension = world.getDimension(session.replayController.dimension.id);
            const block = dimension.getBlock(location);
            if (!block) {
                console.error(`Failed to get block at ${location.x}, ${location.y}, ${location.z}`);
                return;
            }

            block.setPermutation(BlockPermutation.resolve(typeId, states));
        }

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

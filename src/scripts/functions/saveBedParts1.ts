import { Block, Player } from "@minecraft/server";
import { SharedVariables } from "../data/replay-player-session";
export function saveBedParts1(block: Block, player: Player) {
    //Calculate Orher Part Of Bed
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    const isHead = block.permutation.getState("head_piece_bit"); // true if head, false if foot
    const direction = block.permutation.getState("direction"); // 'north = 2', 'south = 0', 'east =3', 'west = 1'
    let otherPartLocation = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z,
    };
    if (isHead) {
        if (direction === 2)
            otherPartLocation = {
                x: block.location.x,
                y: block.location.y,
                z: block.location.z + 1,
            };
        else if (direction === 0)
            otherPartLocation = {
                x: block.location.x,
                y: block.location.y,
                z: block.location.z - 1,
            };
        else if (direction === 3)
            otherPartLocation = {
                x: block.location.x - 1,
                y: block.location.y,
                z: block.location.z,
            };
        else if (direction === 1)
            otherPartLocation = {
                x: block.location.x + 1,
                y: block.location.y,
                z: block.location.z,
            };
    } else {
        if (direction === 2)
            otherPartLocation = {
                x: block.location.x,
                y: block.location.y,
                z: block.location.z - 1,
            };
        else if (direction === 0)
            otherPartLocation = {
                x: block.location.x,
                y: block.location.y,
                z: block.location.z + 1,
            };
        else if (direction === 3)
            otherPartLocation = {
                x: block.location.x + 1,
                y: block.location.y,
                z: block.location.z,
            };
        else if (direction === 1)
            otherPartLocation = {
                x: block.location.x - 1,
                y: block.location.y,
                z: block.location.z,
            };
    }
    const otherPartBlock = block.dimension.getBlock(otherPartLocation);
    if (otherPartBlock && otherPartBlock.typeId !== "minecraft:air") {
        const otherPart = {
            location: otherPartLocation,
            typeId: otherPartBlock.typeId,
            states: otherPartBlock.permutation.getAllStates(),
        };

        const playerData = session.replayBData1Map.get(player.id);
        playerData.dbgBlockData1[session.dbgRecTime] = {
            thisPart: {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates(),
            },
            otherPart,
        };
    }
}

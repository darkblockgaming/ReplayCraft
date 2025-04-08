import { SharedVariables } from "../main";
export function saveBedParts(block, player) { //Calculate Other Part Of Bed
    const isHead = block.permutation.getState("head_piece_bit"); // true if head, false if foot
    const direction = block.permutation.getState("direction"); // 'north = 2', 'south = 0', 'east =3', 'west = 1'
    let otherPartLocation = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z
    };
    if (isHead) {
        if (direction === 2) otherPartLocation = {
            x: block.location.x,
            y: block.location.y,
            z: block.location.z + 1
        };
        else if (direction === 0) otherPartLocation = {
            x: block.location.x,
            y: block.location.y,
            z: block.location.z - 1
        };
        else if (direction === 3) otherPartLocation = {
            x: block.location.x - 1,
            y: block.location.y,
            z: block.location.z
        };
        else if (direction === 1) otherPartLocation = {
            x: block.location.x + 1,
            y: block.location.y,
            z: block.location.z
        };
    } else {
        if (direction === 2) otherPartLocation = {
            x: block.location.x,
            y: block.location.y,
            z: block.location.z - 1
        };
        else if (direction === 0) otherPartLocation = {
            x: block.location.x,
            y: block.location.y,
            z: block.location.z + 1
        };
        else if (direction === 3) otherPartLocation = {
            x: block.location.x + 1,
            y: block.location.y,
            z: block.location.z
        };
        else if (direction === 1) otherPartLocation = {
            x: block.location.x - 1,
            y: block.location.y,
            z: block.location.z
        };
    }
    const otherPartBlock = block.dimension.getBlock(otherPartLocation);
    if (otherPartBlock && otherPartBlock.typeId !== "minecraft:air") {
        const otherPart = {
            location: otherPartLocation,
            typeId: otherPartBlock.typeId,
            states: otherPartBlock.permutation.getAllStates()
        };

        const playerData = SharedVariables.replayBDataMap.get(player.id);
        playerData.dbgBlockData[SharedVariables.dbgRecTime] = {
            thisPart: {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates()
            },
            otherPart
        };
    }
}
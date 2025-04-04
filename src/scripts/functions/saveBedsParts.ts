import { Block, Player, Vector3 } from "@minecraft/server";
import { SharedVariables } from "../main";

type BlockState = Record<string, any>;

type BlockData = {
    location: Vector3;
    typeId: string;
    states: BlockState;
};

type PlayerReplayData = {
    dbgBlockData: Record<number, { thisPart: BlockData; otherPart: BlockData }>;
};

export function saveBedParts(block: Block, player: Player): void {
    const isHead: boolean = block.permutation.getState("head_piece_bit");
    const direction: number = block.permutation.getState("direction");

    let otherPartLocation: Vector3 = { ...block.location };

    if (isHead) {
        if (direction === 2) otherPartLocation.z += 1;
        else if (direction === 0) otherPartLocation.z -= 1;
        else if (direction === 3) otherPartLocation.x -= 1;
        else if (direction === 1) otherPartLocation.x += 1;
    } else {
        if (direction === 2) otherPartLocation.z -= 1;
        else if (direction === 0) otherPartLocation.z += 1;
        else if (direction === 3) otherPartLocation.x += 1;
        else if (direction === 1) otherPartLocation.x -= 1;
    }

    const otherPartBlock = block.dimension.getBlock(otherPartLocation);
    if (!otherPartBlock || otherPartBlock.typeId === "minecraft:air") return;

    const otherPart: BlockData = {
        location: otherPartLocation,
        typeId: otherPartBlock.typeId,
        states: otherPartBlock.permutation.getAllStates()
    };

  
    let playerData = SharedVariables.replayBDataMap.get(player.id) as unknown as PlayerReplayData | undefined;
    if (!playerData) return;

    playerData.dbgBlockData[Number(SharedVariables.dbgRecTime)] = {
        thisPart: {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates()
        },
        otherPart
    };
}

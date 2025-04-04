import { Vector3 } from "@minecraft/server";
import { SharedVariables } from "../main";

// Define the structure of the block data
interface BlockData {
    location: Vector3;
    typeId: string;
    states: Record<string, any>;
}

export function playBlockSound(blockData: BlockData): void {
    if (!SharedVariables.toggleSound) return;

    const { location } = blockData;

    SharedVariables.dbgRecController.playSound(SharedVariables.soundIds[SharedVariables.selectedSound], {
        location: location
    });
}

import { SharedVariables } from "../main";
export function playBlockSound(blockData) {
    if (SharedVariables.toggleSound === false) return;
    const {
        location,
        typeId,
        states
    } = blockData;
    SharedVariables.dbgRecController.playSound(SharedVariables.soundIds[SharedVariables.selectedSound], {
        position: location
    });
}
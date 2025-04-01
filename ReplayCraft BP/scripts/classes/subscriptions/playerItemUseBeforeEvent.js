import { world } from "@minecraft/server";
import { SharedVariables } from "../../main";

function setController(eventData){
    const player = eventData.source
    if (eventData.itemStack?.typeId === 'minecraft:stick' && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)) {
        if (player === SharedVariables.dbgRecController || !SharedVariables.dbgRecController) {
            if (SharedVariables.multiToggle === false) {
                SharedVariables.multiPlayers = [];
                SharedVariables.multiPlayers.push(player);
            }
        }
    }
} 
const replaycraftItemUseBeforeEvent = () => {
    world.beforeEvents.itemUse.subscribe(setController);
};
export { replaycraftItemUseBeforeEvent };
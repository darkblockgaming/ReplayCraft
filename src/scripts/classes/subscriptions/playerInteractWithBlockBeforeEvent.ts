import { Player, PlayerInteractWithBlockBeforeEvent, world } from "@minecraft/server";

function setController(eventData: PlayerInteractWithBlockBeforeEvent){
    const player = eventData.player
    if (eventData.itemStack?.typeId === 'minecraft:stick' && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)) {
        if (player === dbgRecController || !dbgRecController) {
            if (multiToggle === false) {
                multiPlayers = [];
                multiPlayers.push(player);
            }
        }
    }
} 


const setdbgRecControllerBefore = () => {
    world.beforeEvents.playerInteractWithBlock.subscribe(setController)
};

export { setdbgRecControllerBefore };
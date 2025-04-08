import { world } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { saveDoorPartsB } from "../../functions/saveDoorPartsB";

// need a name for this
function recordBlocks (event){
    if (SharedVariables.replayStateMachine.state === "recPending") {
            const {
                player,
                block
            } = event;
            if (!SharedVariables.multiPlayers.includes(player)) return;
            if (SharedVariables.twoPartBlocks.includes(block.type.id)) {
                saveDoorPartsB(block, player);
            } else {
                const playerData = SharedVariables.replayBDataBMap.get(player.id);
                playerData.dbgBlockDataB[SharedVariables.dbgRecTime] = {
                    location: block.location,
                    typeId: block.typeId,
                    states: block.permutation.getAllStates()
                };
            }
        }
} 


const replaycraftInteractWithBlockAfterEvent = () => {
    world.afterEvents.playerInteractWithBlock.subscribe(recordBlocks);
};

export { replaycraftInteractWithBlockAfterEvent }
import { world } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { saveBedParts } from "../../functions/saveBedsParts";
import { saveDoorParts } from "../../functions/saveDoorParts";
function recordBlocks(event){
    if (SharedVariables.replayStateMachine.state === "recPending") {
        const {
            player,
            block
        } = event;
        if (!SharedVariables.multiPlayers.includes(player)) return;
        if (block.typeId === "minecraft:bed" || SharedVariables.twoPartBlocks.includes(block.type.id)) {
            if (block.typeId === "minecraft:bed") {
                saveBedParts(block, player);
            } else {
                saveDoorParts(block, player);
            }
        } else {
            const playerData = SharedVariables.replayBDataMap.get(player.id);
            playerData.dbgBlockData[SharedVariables.dbgRecTime] = {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates()
            };
        }
    }
} 


const playerBreakBlock = () => {
    world.beforeAfter.playerBreakBlock.subscribe(recordBlocks)
};

export { playerBreakBlock };
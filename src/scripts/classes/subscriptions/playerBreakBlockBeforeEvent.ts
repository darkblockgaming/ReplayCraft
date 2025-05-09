import { saveBedParts1 } from "../../functions/saveBedParts1";
import { saveDoorParts1 } from "../../functions/saveDoorsParts1";
import { SharedVariables } from "../../main";
import { PlayerBreakBlockBeforeEvent, world } from "@minecraft/server";
//@ts-check
function recordBlocks(event: PlayerBreakBlockBeforeEvent) {
    if (SharedVariables.replayStateMachine.state === "recPending") {
        const {
            player,
            block
        } = event;
        if (!SharedVariables.multiPlayers.includes(player)) return;
        if (block.typeId === "minecraft:bed" || SharedVariables.twoPartBlocks.includes(block.type.id)) {
            if (block.typeId === "minecraft:bed") {
                saveBedParts1(block, player);
            } else {
                saveDoorParts1(block, player);
            }
        } else {
            const playerData = SharedVariables.replayBData1Map.get(player.id);
            playerData.dbgBlockData1[SharedVariables.dbgRecTime] = {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates()
            };
            //dbgBlockData1[SharedVariables.dbgRecTime] = { location: block.location, typeId: block.typeId, states: block.permutation.getAllStates() };
        }
    }
};


const replaycraftBreakBlockBeforeEvent = () => {
    world.beforeEvents.playerBreakBlock.subscribe(recordBlocks)
};

export { replaycraftBreakBlockBeforeEvent };
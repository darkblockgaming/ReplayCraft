import { world } from "@minecraft/server";
import { SharedVariables } from "../../main";

function setController(eventData){
    const player = eventData.player
    if (eventData.itemStack?.typeId === 'minecraft:stick' && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)) {
        if (player === SharedVariables.dbgRecController || !SharedVariables.dbgRecController) {
            if (SharedVariables.multiToggle === false) {
                SharedVariables.multiPlayers = [];
                SharedVariables.multiPlayers.push(player);
            }
        }
    }
} 

function b (event){
    if (SharedVariables.replayStateMachine.state === "recPending") {
		const {
			player,
			block
		} = event;
		if (!SharedVariables.multiPlayers.includes(player)) return;
		if (twoPartBlocks.includes(block.type.id)) {
			saveDoorParts1(block, player);
		} else {
			const playerData = SharedVariables.replayBData1Map.get(player.id);
			playerData.dbgBlockData1[SharedVariables.dbgRecTime] = {
				location: block.location,
				typeId: block.typeId,
				states: block.permutation.getAllStates()
			};
		}
	}
}


const replaycraftInteractWithBlockBeforeEvent = () => {
    world.beforeEvents.playerInteractWithBlock.subscribe(setController);
    world.beforeEvents.playerInteractWithBlock.subscribe(b);
};
export { replaycraftInteractWithBlockBeforeEvent };
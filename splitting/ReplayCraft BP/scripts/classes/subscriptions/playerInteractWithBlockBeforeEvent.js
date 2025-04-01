import { world } from "@minecraft/server";
import { SharedVariables } from "../../main";



function recordBlocks (event){
    if (SharedVariables.replayStateMachine.state === "recPending") {
		const {
			player,
			block
		} = event;
		if (!SharedVariables.multiPlayers.includes(player)) return;
		if (SharedVariables.twoPartBlocks.includes(block.type.id)) {
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
    world.beforeEvents.playerInteractWithBlock.subscribe(recordBlocks);
};
export { replaycraftInteractWithBlockBeforeEvent };
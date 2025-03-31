
import { world } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { saveDoorPartsB } from "../../functions/saveDoorPartsB";
function setController(eventData){
    const player = eventData.player;
	if (eventData.itemStack?.typeId === 'minecraft:stick' && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)) {
		if (player === SharedVariables.dbgRecController || !SharedVariables.dbgRecController) {
			SharedVariables.multiPlayers.forEach((player) => {
				if (!SharedVariables.replayBDataMap.has(player.id)) {
					SharedVariables.replayBDataMap.set(player.id, {
						dbgBlockData: {}
					});
					SharedVariables.replayBDataBMap.set(player.id, {
						dbgBlockDataB: {}
					});
					SharedVariables.replayBData1Map.set(player.id, {
						dbgBlockData1: {}
					});
					SharedVariables.replayPosDataMap.set(player.id, {
						dbgRecPos: []
					});
					SharedVariables.replayRotDataMap.set(player.id, {
						dbgRecRot: []
					});
					SharedVariables.replayMDataMap.set(player.id, {
						isSneaking: []
					});
					SharedVariables.replayODataMap.set(player.id, {
						customEntity: undefined
					});
					SharedVariables.replaySDataMap.set(player.id, {
						weapon1: [],
						weapon2: [],
						armor1: [],
						armor2: [],
						armor3: [],
						armor4: []
					});
				}
			});
            SharedVariables.replayStateMachine.handleEvent(player);
			
			//player.onScreenDisplay.setActionBar(`${player.name} ${player.id}`);
		} else {
			player.onScreenDisplay.setActionBar(`${SharedVariables.dbgRecController.name} is controlling the replay.`);
		}
	}
}
// need a name for this
function b (event){
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
    world.afterEvents.playerInteractWithBlock.subscribe(setController);
    world.afterEvents.playerInteractWithBlock.subscribe(b);
};

export { replaycraftInteractWithBlockAfterEvent }
import { world } from "@minecraft/server";
import { SharedVariables } from "../../main";

function setController(eventData){
	console.log(player.name);
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
			
			//player.onScreenDisplay.setActionBar(${player.name} ${player.id});
		} else {
			player.onScreenDisplay.setActionBar(`${SharedVariables.dbgRecController.name} is controlling the replay.`);
		}
	}
}


const replaycraftItemUseAfterEvent = () => {
world.afterEvents.playerInteractWithBlock.subscribe(setController);
};

export { replaycraftItemUseAfterEvent }
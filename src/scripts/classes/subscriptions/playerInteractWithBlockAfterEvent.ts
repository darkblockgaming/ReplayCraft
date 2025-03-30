import { PlayerInteractWithBlockAfterEvent, world } from "@minecraft/server";

function setController(eventData: PlayerInteractWithBlockAfterEvent){
    const player = eventData.player;
	if (eventData.itemStack?.typeId === 'minecraft:stick' && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)) {
		if (player === dbgRecController || !dbgRecController) {
			multiPlayers.forEach((player) => {
				if (!replayBDataMap.has(player.id)) {
					replayBDataMap.set(player.id, {
						dbgBlockData: {}
					});
					replayBDataBMap.set(player.id, {
						dbgBlockDataB: {}
					});
					replayBData1Map.set(player.id, {
						dbgBlockData1: {}
					});
					replayPosDataMap.set(player.id, {
						dbgRecPos: []
					});
					replayRotDataMap.set(player.id, {
						dbgRecRot: []
					});
					replayMDataMap.set(player.id, {
						isSneaking: []
					});
					replayODataMap.set(player.id, {
						customEntity: undefined
					});
					replaySDataMap.set(player.id, {
						weapon1: [],
						weapon2: [],
						armor1: [],
						armor2: [],
						armor3: [],
						armor4: []
					});
				}
			});
            replayStateMachine.handleEvent(player);
			
			//player.onScreenDisplay.setActionBar(`${player.name} ${player.id}`);
		} else {
			player.onScreenDisplay.setActionBar(`${dbgRecController.name} is controlling the replay.`);
		}
	}
} 


const setdbgRecControllerAfter= () => {
    world.afterEvents.playerInteractWithBlock.subscribe(setController)
};

export { setdbgRecControllerAfter };
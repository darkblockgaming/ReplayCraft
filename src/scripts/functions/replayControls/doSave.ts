import { Player } from "@minecraft/server";
import {  SharedVariables } from "../../main";
import { clearStructure } from "../clearStructure";
import { replayCraftDB } from "../../classes/subscriptions/world-initialize";

export function doSave(player: Player) {
	replayCraftDB.set(player.id,SharedVariables.replayBDataMap);
	SharedVariables.replayStateMachine.setState("recSaved");
	if (SharedVariables.textPrompt) {
		player.onScreenDisplay.setActionBar({
			"rawtext": [{
				"translate": "dbg.rc1.mes.rec.saved.successfully"
			}]
		});
	}
	SharedVariables.multiPlayers.forEach((player) => {
		clearStructure(player);
	});
	

}
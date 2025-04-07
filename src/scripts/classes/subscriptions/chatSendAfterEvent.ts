import { ChatSendAfterEvent, world } from "@minecraft/server";
import { replayCraftBlockDB, replayCraftPlayerActionsDB, replayCraftPlayerPosDB, replayCraftPlayerRotDB } from "./world-initialize";
import { SharedVariables } from "../../main";
import { loadFromDB } from "../../functions/replayControls/load-from-database";

function giveItems(event: ChatSendAfterEvent) {
	const {sender, message} = event;
	if (["?rc", "?dbgReplayCraft", "?ReplayCraft", "?replaycraft", "?RC", "?dbgreplaycraft"].includes(message)) {
		sender.runCommand(`loot give @s loot "rc_items"`);
		sender.onScreenDisplay.setActionBar({
			"rawtext": [{
				"translate": "dbg.rc1.mes.thanks"
			}]
		});
	}
	if(message ==="?listdb"){
		console.log(`data in map: `);
		console.log(JSON.stringify(Object.fromEntries(SharedVariables.replayBDataMap), null, 2));
		console.log("Data in the BlockDB: ");
		console.log(JSON.stringify(replayCraftBlockDB.get(sender.id), null, 2));
		console.log("Data in the PlayerPosDB: ");
		console.log(JSON.stringify(replayCraftPlayerPosDB.get(sender.id), null, 2));
		console.log("Data in the PlayerRotDB: ");
		console.log(JSON.stringify(replayCraftPlayerRotDB.get(sender.id), null, 2));
		console.log("Data in the PlayerActionsDB: ");
		console.log(JSON.stringify(replayCraftPlayerActionsDB.get(sender.id), null, 2));
        //sender.sendMessage(JSON.stringify(replayCraftDB.get(sender.id), null, 2));
	}
	if(message === "?loaddb"){
	loadFromDB(sender, "test");
	}

}

const afterChatSend = () => {
	world.afterEvents.chatSend.subscribe(giveItems);
};

export { afterChatSend };
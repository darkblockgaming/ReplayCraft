import { ChatSendAfterEvent, world } from "@minecraft/server";
import { replayCraftDB } from "../../main";

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
	if(message ==="listbd"){
		sender.sendMessage(replayCraftDB.get(sender.id));
	}

}

const afterChatSend = () => {
	world.afterEvents.chatSend.subscribe(giveItems);
};

export { afterChatSend };
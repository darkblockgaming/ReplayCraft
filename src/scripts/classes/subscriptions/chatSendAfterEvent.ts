import { ChatSendAfterEvent,  world } from "@minecraft/server";
import { setSkin } from "../../ui/settings/setSkin";

function giveItems(event: ChatSendAfterEvent) {
	const {sender, message} = event;
	if (["?rc", "?dbgReplayCraft", "?ReplayCraft", "?replaycraft", "?RC", "?dbgreplaycraft"].includes(message)) {
		sender.runCommand(`loot give @s loot "rc_items"`);
		sender.sendMessage({
			"rawtext": [{
				"translate": "dbg.rc1.mes.thanks"
			}]
		});
	}

	//Chat command to show the settings UI 
	if(message === "?skin"){
		setSkin(sender);
	}
	

}


const afterChatSend = () => {
	world.afterEvents.chatSend.subscribe(giveItems);
};

export { afterChatSend };
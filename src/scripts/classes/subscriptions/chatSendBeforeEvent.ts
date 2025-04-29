import { ChatSendBeforeEvent,  world } from "@minecraft/server";
import { setSkin } from "../../ui/settings/setSkin";

function giveItems(event: ChatSendBeforeEvent) {
	const {sender, message} = event;
	if (["?rc", "?dbgReplayCraft", "?ReplayCraft", "?replaycraft", "?RC", "?dbgreplaycraft"].includes(message)) {
		sender.runCommand(`loot give @s loot "rc_items"`);
		sender.sendMessage({
			"rawtext": [{
				"translate": "dbg.rc1.mes.thanks"
			}]
		});
	event.cancel = true;
	}

	//Chat command to show the settings UI 
	if(message === "?skin"){
		setSkin(sender);
		event.cancel = true;
	}
	
}


const beforeChatSend = () => {
	world.beforeEvents.chatSend.subscribe(giveItems);
};

export { beforeChatSend };
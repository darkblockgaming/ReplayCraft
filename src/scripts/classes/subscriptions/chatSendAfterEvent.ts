import { ChatSendAfterEvent, world } from "@minecraft/server";
import { replayCraftSettingsDB } from "./world-initialize";

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
	
if (message === "print"){
	console.log(replayCraftSettingsDB.entries);
}
}


const afterChatSend = () => {
	world.afterEvents.chatSend.subscribe(giveItems);
};

export { afterChatSend };
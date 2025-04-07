import { ChatSendAfterEvent, world } from "@minecraft/server";

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
	

}

const afterChatSend = () => {
	world.afterEvents.chatSend.subscribe(giveItems);
};

export { afterChatSend };
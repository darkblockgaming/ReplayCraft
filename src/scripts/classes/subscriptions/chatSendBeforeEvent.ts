import { ChatSendBeforeEvent,  system,  world } from "@minecraft/server";
import { setSkin } from "../../ui/settings/setSkin";
import { showDatabaseListUI } from "../../ui/debug/db-size";
import { replayCraftBeforeBlockInteractionsDB, replayCraftBlockDB, replayCraftBlockInteractionsDB, replayCraftPlaybackEntityDB, replayCraftPlayerActionsDB, replayCraftPlayerArmorWeaponsDB, replayCraftPlayerPosDB, replayCraftPlayerRotDB, replayCraftSettingsDB, replayCraftSkinDB } from"../../classes/subscriptions/world-initialize";
import { OptimizedDatabase } from "../../data/data-hive";

function giveItems(event: ChatSendBeforeEvent) {
	const {sender, message} = event;
	if (["?rc", "?dbgReplayCraft", "?ReplayCraft", "?replaycraft", "?RC", "?dbgreplaycraft"].includes(message)) {
		system.run(() => {
			sender.runCommand(`loot give @s loot "rc_items"`);
			sender.sendMessage({
			"rawtext": [{
				"translate": "dbg.rc1.mes.thanks"
			}]
		});
	event.cancel = true;
	})
		
	}

	//Chat command to show the settings UI 
	if(message === "?skin"){
		system.run(() => {
		setSkin(sender);
		});
		event.cancel = true;
	}

	if (message === "?dbstats") {
		system.run(() => {
			showDatabaseListUI(sender);
			});
        event.cancel = true;
        
    }
	if (message === "?dblist") {
		system.run(() => {
			for (const [key, value] of replayCraftBlockDB.entries()) {
				console.log(`[${key}]`, value);
			}
			});
        event.cancel = true;
        
    }
	if (message === "?dbpointers") {
		system.run(() => {
			const allDatabases: [string, OptimizedDatabase | undefined][] = [

				["Block Data", replayCraftBlockDB],
				["Player Position", replayCraftPlayerPosDB],
				["Player Rotation", replayCraftPlayerRotDB],
				["Player Actions", replayCraftPlayerActionsDB],
				["Block Interactions", replayCraftBlockInteractionsDB],
				["Before Block Interactions", replayCraftBeforeBlockInteractionsDB],
				["Playback Entities", replayCraftPlaybackEntityDB],
				["Armor & Weapons", replayCraftPlayerArmorWeaponsDB],
				["Player Skins", replayCraftSkinDB],
				["Settings", replayCraftSettingsDB]
			];
	
			allDatabases.forEach(([dbName, db]) => {
				if (db) {
					db.rebuildPointers(); // <- Rebuild before logging
					console.log(`Pointers for ${dbName}:`);
					const pointers = db["entries"]().map(([k]) => k);
					pointers.forEach((pointer) => console.log(pointer));
				} else {
					console.warn(`Database '${dbName}' is not defined, skipping.`);
				}
			});
		});
	
		event.cancel = true;
	}

	
}


const beforeChatSend = () => {
	world.beforeEvents.chatSend.subscribe(giveItems);
};

export { beforeChatSend };

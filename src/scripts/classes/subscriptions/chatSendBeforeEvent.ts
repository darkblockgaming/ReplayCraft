import {ChatSendBeforeEvent, EntityInventoryComponent, ItemStack, system, world} from "@minecraft/server";
import { setSkin } from "../../ui/settings/setSkin";
import { showDatabaseListUI } from "../../ui/debug/db-size";
import {
	replayCraftBeforeBlockInteractionsDB,
	replayCraftBlockDB,
	replayCraftBlockInteractionsDB,
	replayCraftPlaybackEntityDB,
	replayCraftPlayerActionsDB,
	replayCraftPlayerArmorWeaponsDB,
	replayCraftPlayerPosDB,
	replayCraftPlayerRotDB,
	replayCraftSettingsDB,
	replayCraftSkinDB,
  } from "../../classes/subscriptions/world-initialize";

import { OptimizedDatabase } from "../../data/data-hive";
import { playerDataDisplay, SharedVariablesDisplay } from "../../main";
import config from "../../data/config";

  
  function giveItems(event: ChatSendBeforeEvent) {
	const { sender, message } = event;
  
	// Handles commands like "?rc" and its variations
	if (
	  [
		"?rc",
		"?dbgReplayCraft",
		"?ReplayCraft",
		"?replaycraft",
		"?RC",
		"?dbgreplaycraft",
	  ].includes(message)
	) {
	  system.run(() => {
		const targetPlayerinv = sender.getComponent("inventory") as EntityInventoryComponent;
		const container = targetPlayerinv.container;
		const maxSlots = 36;
  
		// Find two free slots
		const freeSlots: number[] = [];
		for (let i = 0; i < maxSlots && freeSlots.length < 2; i++) {
		  const item = container.getItem(i);
		  if (!item?.typeId) {
			freeSlots.push(i);
		  }
		}
  
		if (freeSlots.length < 2) {
		  sender.sendMessage(`Not enough free slots!`);
		} else {
		  const item1 = new ItemStack("minecraft:stick");
		  item1.nameTag = "Replay";
		  container.setItem(freeSlots[0], item1);
  
		  const item2 = new ItemStack("minecraft:stick");
		  item2.nameTag = "Cinematic";
		  container.setItem(freeSlots[1], item2);
  
		  sender.sendMessage({
			rawtext: [{ translate: "dbg.rc1.mes.thanks" }],
		  });
		}
	  });
  
	  event.cancel = true;
	  return;
	}
  
	// Opens the skin selection UI
	if (message === "?skin") {
	  system.run(() => {
		setSkin(sender);
	  });
	  event.cancel = true;
	  return;
	}
if(config.devChatCommands === true) {
	// Opens the database stats UI
	if (message === "?dbstats") {
	  system.run(() => {
		showDatabaseListUI(sender);
	  });
	  event.cancel = true;
	  return;
	}
	if (message === "?playerData") {
		system.run(() => {
		  playerDataDisplay(sender);
		});
		event.cancel = true;
		return;
	  }
	  if (message === "?snapshot") {
		system.run(() => {
		  SharedVariablesDisplay();
		});
		event.cancel = true;
		return;
	  }
  
	// Logs all keys and values from replayCraftBlockDB
	if (message === "?dblist") {
	  system.run(() => {
		for (const [key, value] of replayCraftBlockDB.entries()) {
		  console.log(`[${key}]`, value);
		}
	  });
	  event.cancel = true;
	  return;
	}
  
	// Rebuilds and logs pointers for all key databases
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
		  ["Settings", replayCraftSettingsDB],
		];
  
		allDatabases.forEach(([dbName, db]) => {
		  if (db) {
			db.rebuildPointers();
			console.log(`Pointers for ${dbName}:`);
			const pointers = db["entries"]().map(([k]) => k);
			pointers.forEach((pointer) => console.log(pointer));
		  } else {
			console.warn(`Database '${dbName}' is not defined, skipping.`);
		  }
		});
	  });
	  event.cancel = true;
	  return;
	}
  }
}
  
  // Subscribe to chat commands
  const beforeChatSend = () => {
	world.beforeEvents.chatSend.subscribe(giveItems);
  };
  
  export { beforeChatSend };
  
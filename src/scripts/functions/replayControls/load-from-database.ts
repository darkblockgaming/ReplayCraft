import { SharedVariables } from "../../main";
import { replayCraftBeforeBlockInteractionsDB, replayCraftBlockDB, replayCraftBlockInteractionsDB, replayCraftPlaybackEntityDB, replayCraftPlayerActionsDB, replayCraftPlayerArmorWeaponsDB, replayCraftPlayerPosDB, replayCraftPlayerRotDB, replayCraftSettingsDB } from "../../classes/subscriptions/world-initialize";
import { Player, world } from "@minecraft/server";
import { replayMenuAfterLoad } from "../../ui/replay-menu-afterload";

export function loadFromDB(player: Player, buildName: string) {
    // Load the Map databases back into the maps in SharedVariables for the time being this is going to be removed as the database is faster than maos 
    SharedVariables.replayBDataMap.delete(player.id);
    SharedVariables.replayPosDataMap.delete(player.id);
    SharedVariables.replayRotDataMap.delete(player.id);
    SharedVariables.replayMDataMap.delete(player.id);
    const savedPlayerBlockData = replayCraftBlockDB.get(player.id + buildName);
    const savedPlayerPositionData = replayCraftPlayerPosDB.get(player.id + buildName);
    const savedPlayerRotationDate = replayCraftPlayerRotDB.get(player.id + buildName);
    const savedPlayerActionsData = replayCraftPlayerActionsDB.get(player.id + buildName);
    const savedPlayerBlockInteractionsData = replayCraftBlockInteractionsDB.get(player.id + buildName);
    const savedPlayerBeforeBlockInteractionsData = replayCraftBeforeBlockInteractionsDB.get(player.id + buildName);
    const savedPlayBackEntityData = replayCraftPlaybackEntityDB.get(player.id + buildName);
    const savedPlayerArmorWeaponsData = replayCraftPlayerArmorWeaponsDB.get(player.id + buildName);
    
        SharedVariables.replayBDataMap.set(player.id, savedPlayerBlockData);
        SharedVariables.replayPosDataMap.set(player.id, savedPlayerPositionData);
        SharedVariables.replayRotDataMap.set(player.id, savedPlayerRotationDate);
        SharedVariables.replayMDataMap.set(player.id, savedPlayerActionsData);
        SharedVariables.replayBDataBMap.set(player.id, savedPlayerBlockInteractionsData);
        SharedVariables.replayBData1Map.set(player.id, savedPlayerBeforeBlockInteractionsData);
        SharedVariables.replayODataMap.set(player.id, savedPlayBackEntityData);
        SharedVariables.replaySDataMap.set(player.id, savedPlayerArmorWeaponsData);
    
    
    // Load SharedVariables from the database.
    const savedSettingsRaw = replayCraftSettingsDB.get(player.id + buildName);
    if (!savedSettingsRaw) return;

    try {
        const savedSettings = JSON.parse(savedSettingsRaw);

        for (const [key, value] of Object.entries(savedSettings)) {
            if (SharedVariables.hasOwnProperty(key)) {
                // Only overwrite if it's a valid key in SharedVariables
                (SharedVariables as Record<string, unknown>)[key] = value;
            }
        }

        // If dbgRecController is restored update it to reference the actual player object
        if (SharedVariables.dbgRecController) {
            const actualPlayer = world.getPlayers().find(p => p.id === SharedVariables.dbgRecController.id);
            if (actualPlayer) {
                SharedVariables.dbgRecController = actualPlayer; // Update the reference to the actual player object
            }
        }

        console.warn(`[✅] Settings restored for ${player.id}`);
    } catch (err) {
        console.error(`[❌] Failed to restore settings for ${player.id}:`, err);
    }

   // Call UI 
   replayMenuAfterLoad(player);
}

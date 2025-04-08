import { SharedVariables } from "../../main";
import { replayCraftBeforeBlockInteractionsDB, replayCraftBlockDB, replayCraftBlockInteractionsDB, replayCraftPlaybackEntityDB, replayCraftPlayerActionsDB, replayCraftPlayerArmorWeaponsDB, replayCraftPlayerPosDB, replayCraftPlayerRotDB, replayCraftSettingsDB } from "../../classes/subscriptions/world-initialize";
import { Player, world } from "@minecraft/server";
import { replayMenuAfterLoad } from "../../ui/replay-menu-afterload";

export function loadFromDB(player: Player, buildName: string, showUI: boolean) {
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

        // If dbgRecController must be updated and re assigned to the player object.
        if (SharedVariables.dbgRecController) {
            const actualPlayer = world.getPlayers().find(p => p.id === SharedVariables.dbgRecController.id);
            if (actualPlayer) {
                SharedVariables.dbgRecController = actualPlayer; // Update the reference to the actual player object
            }
        }
        //dbgCamAffectPlayer must be updated and re assigned to the player object.
        if (Array.isArray(SharedVariables.dbgCamAffectPlayer) && SharedVariables.dbgCamAffectPlayer.length > 0) {
            const players = world.getPlayers();
            SharedVariables.dbgCamAffectPlayer = SharedVariables.dbgCamAffectPlayer
                .map(oldPlayer => players.find(p => p.id === oldPlayer.id))
                .filter(Boolean);
        }

          //multiplayer array must be updated and re assigned to the player object.
          if (Array.isArray(SharedVariables.multiPlayers) && SharedVariables.multiPlayers.length > 0) {
            const players = world.getPlayers();
            SharedVariables.multiPlayers = SharedVariables.multiPlayers
                .map(oldPlayer => players.find(p => p.id === oldPlayer.id))
                .filter(Boolean);
        }

        console.warn(`[✅] Settings restored for ${player.id}`);
    } catch (err) {
        console.error(`[❌] Failed to restore settings for ${player.id}:`, err);
    }
    for (const player of SharedVariables.multiPlayers) {
        console.log(player.name, player.id);
        
        // Delete existing data maps for the player
        SharedVariables.replayBDataMap.delete(player.id);
        SharedVariables.replayPosDataMap.delete(player.id);
        SharedVariables.replayRotDataMap.delete(player.id);
        SharedVariables.replayMDataMap.delete(player.id);
        SharedVariables.replayBDataBMap.delete(player.id);
        SharedVariables.replayBData1Map.delete(player.id);
        SharedVariables.replayODataMap.delete(player.id);
        SharedVariables.replaySDataMap.delete(player.id);
        
        // Retrieve player data from DB
        const savedPlayerBlockData = replayCraftBlockDB.get(player.id + buildName);
        const savedPlayerPositionData = replayCraftPlayerPosDB.get(player.id + buildName);
        const savedPlayerRotationDate = replayCraftPlayerRotDB.get(player.id + buildName);
        const savedPlayerActionsData = replayCraftPlayerActionsDB.get(player.id + buildName);
        const savedPlayerBlockInteractionsData = replayCraftBlockInteractionsDB.get(player.id + buildName);
        const savedPlayerBeforeBlockInteractionsData = replayCraftBeforeBlockInteractionsDB.get(player.id + buildName);
        const savedPlayBackEntityData = replayCraftPlaybackEntityDB.get(player.id + buildName);
        const savedPlayerArmorWeaponsData = replayCraftPlayerArmorWeaponsDB.get(player.id + buildName);
    
        // Check if any of the required data is missing and log a warning
        if (!savedPlayerBlockData || !savedPlayerPositionData || !savedPlayerRotationDate || !savedPlayerActionsData || !savedPlayerBlockInteractionsData || !savedPlayerBeforeBlockInteractionsData || !savedPlayBackEntityData || !savedPlayerArmorWeaponsData) {
            console.warn(`[⚠️] Missing replay data for player ${player.name} (${player.id})`);
        }
    
        // Only set data if available
        if (savedPlayerBlockData) SharedVariables.replayBDataMap.set(player.id, savedPlayerBlockData);
        if (savedPlayerPositionData) SharedVariables.replayPosDataMap.set(player.id, savedPlayerPositionData);
        if (savedPlayerRotationDate) SharedVariables.replayRotDataMap.set(player.id, savedPlayerRotationDate);
        if (savedPlayerActionsData) SharedVariables.replayMDataMap.set(player.id, savedPlayerActionsData);
        if (savedPlayerBlockInteractionsData) SharedVariables.replayBDataBMap.set(player.id, savedPlayerBlockInteractionsData);
        if (savedPlayerBeforeBlockInteractionsData) SharedVariables.replayBData1Map.set(player.id, savedPlayerBeforeBlockInteractionsData);
        if (savedPlayBackEntityData) SharedVariables.replayODataMap.set(player.id, savedPlayBackEntityData);
        if (savedPlayerArmorWeaponsData) SharedVariables.replaySDataMap.set(player.id, savedPlayerArmorWeaponsData);
    }

   // Call UI 
   if(showUI) {
   replayMenuAfterLoad(player);
   }
}

import { Player } from "@minecraft/server";
import { replayCraftBlockDB, replayCraftPlayerActionsDB, replayCraftPlayerPosDB, replayCraftPlayerRotDB, replayCraftBlockInteractionsDB, replayCraftBeforeBlockInteractionsDB, replayCraftSettingsDB, replayCraftPlaybackEntityDB, replayCraftPlayerArmorWeaponsDB } from "../../classes/subscriptions/world-initialize";
import { SharedVariables } from "../../main";
export function saveToDB(player: Player) {

     /**
      * Check if SharedVariables.multiPlayers is an array and has at least one player.
    */
    if (!Array.isArray(SharedVariables.multiPlayers) || SharedVariables.multiPlayers.length === 0) {
        console.warn("[⚠️] No players found in SharedVariables.multiPlayers.");
        return;
    }

    /**
     * Iterate through each player in SharedVariables.multiPlayers and save their data to the database.
     * This is required to ensure that each player's data is saved correctly.
     * This is important for multiplayer scenarios where multiple players are involved.
    */
    for (const currentPlayer of SharedVariables.multiPlayers) {
        console.log(`Saving data for player: ${currentPlayer.name} (${currentPlayer.id})`);

        // Retrieve data for each player
        const PlayerBlockData = SharedVariables.replayBDataMap.get(currentPlayer.id);
        const playerPositionData = SharedVariables.replayPosDataMap.get(currentPlayer.id);
        const playerRotationDate = SharedVariables.replayRotDataMap.get(currentPlayer.id);
        const playerActionsData = SharedVariables.replayMDataMap.get(currentPlayer.id);
        const playerBlockInteractionsData = SharedVariables.replayBDataBMap.get(currentPlayer.id);
        const playerBeforeBlockInteractionsData = SharedVariables.replayBData1Map.get(currentPlayer.id);
        const playBackEntityData = SharedVariables.replayODataMap.get(currentPlayer.id);
        const playerArmorWeaponsData = SharedVariables.replaySDataMap.get(currentPlayer.id);

        // Check if data exists and log warnings if any data is missing
        if (!PlayerBlockData) console.warn(`[⚠️] Missing block data for player ${currentPlayer.id}`);
        if (!playerPositionData) console.warn(`[⚠️] Missing position data for player ${currentPlayer.id}`);
        if (!playerRotationDate) console.warn(`[⚠️] Missing rotation data for player ${currentPlayer.id}`);
        if (!playerActionsData) console.warn(`[⚠️] Missing action data for player ${currentPlayer.id}`);
        if (!playerBlockInteractionsData) console.warn(`[⚠️] Missing block interaction data for player ${currentPlayer.id}`);
        if (!playerBeforeBlockInteractionsData) console.warn(`[⚠️] Missing before block interaction data for player ${currentPlayer.id}`);
        if (!playBackEntityData) console.warn(`[⚠️] Missing playback entity data for player ${currentPlayer.id}`);
        if (!playerArmorWeaponsData) console.warn(`[⚠️] Missing armor/weapons data for player ${currentPlayer.id}`);

        // Save data for each player only if it exists
        if (PlayerBlockData) replayCraftBlockDB.set(currentPlayer.id + SharedVariables.buildName, PlayerBlockData);
        if (playerPositionData) replayCraftPlayerPosDB.set(currentPlayer.id + SharedVariables.buildName, playerPositionData);
        if (playerRotationDate) replayCraftPlayerRotDB.set(currentPlayer.id + SharedVariables.buildName, playerRotationDate);
        if (playerActionsData) replayCraftPlayerActionsDB.set(currentPlayer.id + SharedVariables.buildName, playerActionsData);
        if (playerBlockInteractionsData) replayCraftBlockInteractionsDB.set(currentPlayer.id + SharedVariables.buildName, playerBlockInteractionsData);
        if (playerBeforeBlockInteractionsData) replayCraftBeforeBlockInteractionsDB.set(currentPlayer.id + SharedVariables.buildName, playerBeforeBlockInteractionsData);
        if (playBackEntityData) replayCraftPlaybackEntityDB.set(currentPlayer.id + SharedVariables.buildName, playBackEntityData);
        if (playerArmorWeaponsData) replayCraftPlayerArmorWeaponsDB.set(currentPlayer.id + SharedVariables.buildName, playerArmorWeaponsData);

        console.log(`[✅] Data saved for player: ${currentPlayer.id}`);
    }

     /**
     * SharedVariables are stored in a single database called `replayCraftSettingsDB`.
     */
    
    // Filter out Maps and Functions before saving general SharedVariables
    const filteredSettings: Record<string, any> = {};

    for (const [key, value] of Object.entries(SharedVariables)) {
        if (
            typeof value !== "function" &&
            !(value instanceof Map) &&
            key !== "replayBDataMap" &&
            key !== "replayBDataBMap" &&
            key !== "replayBData1Map" &&
            key !== "replayPosDataMap" &&
            key !== "replayRotDataMap" &&
            key !== "replayMDataMap" &&
            key !== "replayODataMap" &&
            key !== "replaySDataMap" &&
            key !== "replayStateMachine"
        ) {
            filteredSettings[key] = value;
        }
    }

    // Save the filtered SharedVariables settings for all players
    const dataExists = replayCraftSettingsDB.set(player.id + SharedVariables.buildName, JSON.stringify(filteredSettings));
    //Work around if the data is already present re save again to actually save it.

    if (dataExists) {
        saveToDB(player);
        console.log('Data existed and was overwritten. Resaving is now complete.');
    } else {
        console.log('New data was saved.');
    }
    

    console.log(`[✅] Shared variables saved for all players.`);
}


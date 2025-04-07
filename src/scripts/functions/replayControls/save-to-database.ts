import { replayCraftBlockDB, replayCraftPlayerActionsDB, replayCraftPlayerPosDB, replayCraftPlayerRotDB, replayCraftBlockInteractionsDB, replayCraftBeforeBlockInteractionsDB, replayCraftSettingsDB, replayCraftPlaybackEntityDB, replayCraftPlayerArmorWeaponsDB } from "../../classes/subscriptions/world-initialize";
import { SharedVariables } from "../../main";
import { Player } from "@minecraft/server";

export function saveToDB(player: Player) {
    // Each map is currently saved to an individual database.
    const PlayerBlockData = SharedVariables.replayBDataMap.get(player.id);
    const playerPositionData = SharedVariables.replayPosDataMap.get(player.id);
    const playerRotationDate = SharedVariables.replayRotDataMap.get(player.id);
    const playerActionsData = SharedVariables.replayMDataMap.get(player.id);
    const playerBlockInteractionsData = SharedVariables.replayBDataBMap.get(player.id);
    const playerBeforeBlockInteractionsData = SharedVariables.replayBData1Map.get(player.id);
    const playBackEntityData = SharedVariables.replayODataMap.get(player.id);
    const playerArmorWeaponsData = SharedVariables.replaySDataMap.get(player.id);

    /**
    * Call the set function to set, the first variable passed to data-hive is the key, the second is the value.
    * The Key must be unique to the player, so we use the player id and the name of the replay that
    * the player has set when starting a recording. This allows the player to have multiple replays.
    */
    replayCraftBlockDB.set(player.id + SharedVariables.buildName, PlayerBlockData);
    replayCraftPlayerPosDB.set(player.id + SharedVariables.buildName, playerPositionData);
    replayCraftPlayerRotDB.set(player.id + SharedVariables.buildName, playerRotationDate);
    replayCraftPlayerActionsDB.set(player.id + SharedVariables.buildName, playerActionsData);
    replayCraftBlockInteractionsDB.set(player.id + SharedVariables.buildName, playerBlockInteractionsData);
    replayCraftBeforeBlockInteractionsDB.set(player.id + SharedVariables.buildName, playerBeforeBlockInteractionsData);
    replayCraftPlaybackEntityDB.set(player.id + SharedVariables.buildName, playBackEntityData);
    replayCraftPlayerArmorWeaponsDB.set(player.id + SharedVariables.buildName, playerArmorWeaponsData);

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
            key !== "replayStateMachine" // Exclude replayStateMachine, will handle separately
        ) {
            filteredSettings[key] = value;
        }
    }

    // Save the filtered SharedVariables object
    replayCraftSettingsDB.set(player.id + SharedVariables.buildName, JSON.stringify(filteredSettings));
}

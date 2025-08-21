import { world } from "@minecraft/server";
import { OptimizedDatabase } from "../../data/data-hive";

let replayCraftBlockDB: OptimizedDatabase;
let replayCraftPlayerPosDB: OptimizedDatabase;
let replayCraftPlayerRotDB: OptimizedDatabase;
let replayCraftPlayerActionsDB: OptimizedDatabase;
let replayCraftSettingsDB: OptimizedDatabase;
let replayCraftBlockInteractionsDB: OptimizedDatabase;
let replayCraftBeforeBlockInteractionsDB: OptimizedDatabase;
let replayCraftPlaybackEntityDB: OptimizedDatabase;
let replayCraftPlayerArmorWeaponsDB: OptimizedDatabase;
let replayCraftSkinDB: OptimizedDatabase;
let replayCraftActiveSessionsDB: OptimizedDatabase;
let replayCraftAmbientEntityDB: OptimizedDatabase;
let replayCraftAllRecordedPlayerIdsDB: OptimizedDatabase;
let replayCraftTrackedPlayerJoinTicksDB: OptimizedDatabase;
let replayCraftPlayerDamageEventsDB: OptimizedDatabase;
let replayCraftPlayerItemUseEventsDB: OptimizedDatabase;
export {
    replayCraftBlockDB,
    replayCraftPlayerPosDB,
    replayCraftPlayerRotDB,
    replayCraftPlayerActionsDB,
    replayCraftSettingsDB,
    replayCraftBlockInteractionsDB,
    replayCraftBeforeBlockInteractionsDB,
    replayCraftPlaybackEntityDB,
    replayCraftPlayerArmorWeaponsDB,
    replayCraftSkinDB,
    replayCraftActiveSessionsDB,
    replayCraftTrackedPlayerJoinTicksDB,
    replayCraftAmbientEntityDB,
    replayCraftAllRecordedPlayerIdsDB,
    replayCraftPlayerDamageEventsDB,
    replayCraftPlayerItemUseEventsDB,
};
/**
 * Initializes define the database on world initialization.
 */
function onWorldInitialize() {
    replayCraftBlockDB = new OptimizedDatabase("replayCraftDatabase");
    replayCraftPlayerPosDB = new OptimizedDatabase("replayCraftPlayerPosDatabase");
    replayCraftPlayerRotDB = new OptimizedDatabase("replayCraftPlayerRotDatabase");
    replayCraftPlayerActionsDB = new OptimizedDatabase("replayCraftPlayerActionsDatabase");
    replayCraftBlockInteractionsDB = new OptimizedDatabase("replayCraftBlockInteractionsDatabase");
    replayCraftBeforeBlockInteractionsDB = new OptimizedDatabase("replayCraftBeforeBlockInteractionsDatabase");
    replayCraftPlaybackEntityDB = new OptimizedDatabase("replayCraftPlaybackEntityDatabase");
    replayCraftPlayerArmorWeaponsDB = new OptimizedDatabase("replayCraftPlayerArmorWeaponsDatabase");
    replayCraftAmbientEntityDB = new OptimizedDatabase("replayAmbientEntityDatabase");
    // This database is used to store all player IDs that have been recorded in the replay.
    replayCraftAllRecordedPlayerIdsDB = new OptimizedDatabase("replayAllRecordedPlayerIdsDatabase");
    replayCraftTrackedPlayerJoinTicksDB = new OptimizedDatabase("replayTrackedPlayerJoinTicksDatabase");
    //Skin Data for multiplayer recordings
    replayCraftSkinDB = new OptimizedDatabase("replayCraftSkinDatabase");

    // stores the SharedVariables as a whole excluding the maps.
    replayCraftSettingsDB = new OptimizedDatabase("replayCraftSettingsDatabase");

    //store active sessions
    replayCraftActiveSessionsDB = new OptimizedDatabase("replayCraftActiveSessionsDatabase");

    //Store damage data for the players
    replayCraftPlayerDamageEventsDB = new OptimizedDatabase("replayCraftPlayerDamageEventsDataBase");
    replayCraftPlayerItemUseEventsDB = new OptimizedDatabase("replayCraftPlayerItemUseEventsDataBase");
}

/**
 * Subscribes to the world initialization event.
 *
 */
export function subscribeToWorldInitialize() {
    world.afterEvents.worldLoad.subscribe(onWorldInitialize);
}

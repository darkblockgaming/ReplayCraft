import { world } from "@minecraft/server";
import { OptimizedDatabase } from "../../data/data-hive";
import { migrateDatabase } from "../../data/migrate-database";

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
    //Skin Data for multiplayer recordings
    replayCraftSkinDB = new OptimizedDatabase("replayCraftSkinDatabase");

    // stores the SharedVariables as a whole excluding the maps.
    replayCraftSettingsDB = new OptimizedDatabase("replayCraftSettingsDatabase");

    //store active sessions
    replayCraftActiveSessionsDB = new OptimizedDatabase("replayCraftActiveSessionsDatabase");

    migrateDatabase(); // Call the migration function to migrate all databases
}

/**
 * Subscribes to the world initialization event.
 *
 */
export function subscribeToWorldInitialize() {
    world.afterEvents.worldLoad.subscribe(onWorldInitialize);
}

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
let replayAmbientEntityDB: OptimizedDatabase;
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
    replayAmbientEntityDB,
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
    replayAmbientEntityDB = new OptimizedDatabase("replayAmbientEntityDatabase");
    //Skin Data for multiplayer recordings
    replayCraftSkinDB = new OptimizedDatabase("replayCraftSkinDatabase");

    // stores the SharedVariables as a whole excluding the maps.
    replayCraftSettingsDB = new OptimizedDatabase("replayCraftSettingsDatabase");

    //store active sessions
    replayCraftActiveSessionsDB = new OptimizedDatabase("replayCraftActiveSessionsDatabase");
}

/**
 * Subscribes to the world initialization event.
 *
 */
export function subscribeToWorldInitialize() {
    world.afterEvents.worldLoad.subscribe(onWorldInitialize);
}

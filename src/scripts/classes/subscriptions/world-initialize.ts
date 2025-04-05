import { world } from "@minecraft/server";
import { OptimizedDatabase } from "../../data/data-hive";

export let replayCraftDB: OptimizedDatabase;

/**
 * Initializes define the database on world initialization.
 */
function onWorldInitialize() {
    replayCraftDB = new OptimizedDatabase("replayCraftDatabase");
}

/**
 * Subscribes to the world initialization event.
 * 
 */
export function subscribeToWorldInitialize() {
    world.afterEvents.worldLoad.subscribe(onWorldInitialize);
}
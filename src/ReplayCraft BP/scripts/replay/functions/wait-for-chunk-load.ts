import { Player, system, Vector3 } from "@minecraft/server";
import { isChunkLoaded } from "./is-chunk-loaded";
import { debugError, debugLog } from "../data/util/debug";
export async function waitForChunkLoad(position: Vector3, player: Player) {
    let attempts = 10; // Max attempts to wait
    while (!isChunkLoaded(position, player) && attempts > 0) {
        debugLog(`Waiting for chunk to load at ${position.x}, ${position.z}...`);
        await new Promise<void>((resolve) => system.runTimeout(() => resolve(), 5)); // Wait 5 ticks
        attempts--;
    }

    if (attempts === 0) {
        debugError(`Chunk failed to load at ${position.x}, ${position.z} after multiple attempts.`);
    }
}

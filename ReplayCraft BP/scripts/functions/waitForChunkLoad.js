import { isChunkLoaded } from "./isChunkLoaded";
export async function waitForChunkLoad(position, player) {
    let attempts = 10; // Max attempts to wait
    while (!isChunkLoaded(position, player) && attempts > 0) {
        console.log(`Waiting for chunk to load at ${position.x}, ${position.z}...`);
        await new Promise(resolve => system.runTimeout(resolve, 5)); // Wait 5 ticks
        attempts--;
    }

    if (attempts === 0) {
        console.error(`Chunk failed to load at ${position.x}, ${position.z} after multiple attempts.`);
    }
}

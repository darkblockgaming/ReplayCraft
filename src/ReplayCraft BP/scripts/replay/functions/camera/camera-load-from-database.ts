import { Player, system, VanillaEntityIdentifier, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { loadFromExternalServerWithUI } from "../replayControls/load-from-database";
import { debugWarn } from "../../data/util/debug";
import config from "../../data/util/config";

export async function respawnCameraEntities(player: Player) {
    /**
     * Get the player's session from SharedVariables.playerSessions.
     * If the session does not exist, send an error message to the player.
     */
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage("§c[ReplayCraft] Error: No replay session found for you.");
        return;
    }
    /**
     * We must reload the data from the database as the data is cleared when moving back to
     * camera setup mode.
     *
     */

    //We pass false to the loadFromDB function to not show the UI prompt to the player.
    //loadFromDB(player, session.buildName, false);
    const success = await loadFromExternalServerWithUI(player, session.buildName, config.backendURL, false);
    if (!success) {
        player.sendMessage("§c[ReplayCraft] Error: Failed to load replay data. – aborting camera respawn.");
        return;
    }
    const playerDim = player.dimension.id;
    const dim = world.getDimension(playerDim);

    const visitedChunks = new Set();
    const CHUNK_RADIUS = 4 * 16; // same as clearStructure (64 block radius)

    // Remember player's original position
    const originalPos = player.location;
    let playerTeleported = false;

    for (let i = 0; i < session.replayCamPos.length; i++) {
        const cam = session.replayCamPos[i];
        const spawnLocation = {
            x: cam.position.x,
            y: cam.position.y + 1.8,
            z: cam.position.z,
        };

        // Chunk key for visited check
        const chunkKey = `${Math.floor(spawnLocation.x / 16)},${Math.floor(spawnLocation.z / 16)}`;

        // Distance check
        const dx = player.location.x - spawnLocation.x;
        const dz = player.location.z - spawnLocation.z;
        const distanceSquared = dx * dx + dz * dz;
        const isFarAway = distanceSquared > CHUNK_RADIUS * CHUNK_RADIUS;

        // Ensure chunk is loaded if far away
        if (!visitedChunks.has(chunkKey) && isFarAway) {
            visitedChunks.add(chunkKey);

            let success = player.tryTeleport(spawnLocation, { checkForBlocks: false });
            if (!success) {
                success = player.tryTeleport({ x: spawnLocation.x, y: spawnLocation.y + 2, z: spawnLocation.z }, { checkForBlocks: false });
            }

            if (success) {
                await new Promise<void>((resolve) => system.runTimeout(() => resolve(), 5)); // wait ~5 ticks for chunk to load
                playerTeleported = true;
            }
        }

        // Now that chunk should be loaded, spawn entity
        const entity = dim.spawnEntity("dbg:rccampos" as VanillaEntityIdentifier, spawnLocation);
        if (entity) {
            entity.nameTag = `Camera Point ${i + 1}`;
            entity.addTag("owner:" + player.id);
            entity.setProperty("rc:rot_x", session.replayCamRot[i].rotation.x);
            entity.setProperty("rc:rot_y", session.replayCamRot[i].rotation.y);
        } else {
            debugWarn(`[ReplayCraft] Failed to spawn camera entity at ${spawnLocation.x}, ${spawnLocation.y}, ${spawnLocation.z}`);
        }
    }

    // Return player to original position if teleported
    if (playerTeleported) {
        player.tryTeleport(originalPos, { checkForBlocks: false });
    }

    session.replayStateMachine.setState("recCamSetup");
}

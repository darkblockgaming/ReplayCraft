import { Player, VanillaEntityIdentifier, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { loadFromDB } from "../replayControls/load-from-database";

export function respawnCameraEntities(player: Player) {
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
    loadFromDB(player, session.buildName, false);

    /**
     * Now we can spawn the camera entities at the positions stored in the SharedVariables.replayCamPos array.
     */
    const playerDim = player.dimension.id;
    const dim = world.getDimension(playerDim); // or wherever your entities should go

    for (let i = 0; i < session.replayCamPos.length; i++) {
        const cam = session.replayCamPos[i];
        const spawnLocation = {
            x: cam.position.x,
            y: cam.position.y + 1.8, // optional height offset for visibility
            z: cam.position.z,
        };

        const entity = dim.spawnEntity("dbg:rccampos" as VanillaEntityIdentifier, spawnLocation);
        entity.nameTag = `Camera Point ${i + 1}`;
        entity.addTag("owner:" + player.id);
    }
    session.replayStateMachine.setState("recCamSetup");
}

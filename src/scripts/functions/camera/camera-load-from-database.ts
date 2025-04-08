import { Player, world } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { loadFromDB } from "../replayControls/load-from-database";

export function respawnCameraEntities(player: Player) {

    /** 
     * We must reload the data from the database as the data is cleared when moving back to
     * camera setup mode.
     * 
    */
   //We pass false to the loadFromDB function to not show the UI prompt to the player.
   loadFromDB(player, SharedVariables.buildName, false);

    /**
     * Now we can spawn the camera entities at the positions stored in the SharedVariables.replayCamPos array.
     */
    
    const dim = world.getDimension("overworld"); // or wherever your entities should go

    for (let i = 0; i < SharedVariables.replayCamPos.length; i++) {
        const cam = SharedVariables.replayCamPos[i];
        const spawnLocation = {
            x: cam.position.x,
            y: cam.position.y + 1.8, // optional height offset for visibility
            z: cam.position.z
        };

        const entity = dim.spawnEntity("dbg:rccampos", spawnLocation);
        entity.nameTag = `Camera Point ${i + 1}`;
    }
    SharedVariables.replayStateMachine.setState("recCamSetup");
}

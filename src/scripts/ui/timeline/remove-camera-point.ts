import { SharedVariables } from "../../main";
import { Player } from "@minecraft/server";
import { removeEntities } from "../../functions/removeEntities";
import { saveToDB } from "../../functions/replayControls/save-to-database";
import { respawnCameraEntities } from "../../functions/camera/camera-load-from-database";

export function removeCameraPoint(player: Player, index: number) {
    SharedVariables.replayCamPos.splice(index, 1);
    SharedVariables.replayCamRot.splice(index, 1);

    // Update startingValueTick to last camera point tick or 0 if none
    if (SharedVariables.replayCamPos.length > 0) {
        const lastTick = Math.max(...SharedVariables.replayCamPos.map(c => c.tick));
        SharedVariables.startingValueTick = lastTick;
    } else {
        SharedVariables.startingValueTick = 0;
    }

    removeEntities(player, false);
    saveToDB(player);
    respawnCameraEntities(player);
    player.sendMessage(`§cCamera point ${index + 1} removed.`);
}

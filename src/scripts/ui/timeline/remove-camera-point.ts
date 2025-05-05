import { SharedVariables } from "../../main";
import { Player } from "@minecraft/server";
import { removeEntities } from "../../functions/removeEntities";
import { saveToDB } from "../../functions/replayControls/save-to-database";
import { respawnCameraEntities } from "../../functions/camera/camera-load-from-database";

export function removeCameraPoint(player: Player, index: number) {
    SharedVariables.replayCamPos.splice(index, 1);
    SharedVariables.replayCamRot.splice(index, 1);
    removeEntities(player, false);
    saveToDB(player);
    respawnCameraEntities(player);
    player.sendMessage(`§cCamera point ${index + 1} removed.`);
}
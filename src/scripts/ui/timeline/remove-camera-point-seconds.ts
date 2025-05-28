import { SharedVariables } from "../../main";
import { Player } from "@minecraft/server";
import { removeEntities } from "../../functions/removeEntities";
import { saveToDB } from "../../functions/replayControls/save-to-database";
import { respawnCameraEntities } from "../../functions/camera/camera-load-from-database";

export function removeCameraPoint(player: Player, index: number) {
    SharedVariables.replayCamPos.splice(index, 1);
    SharedVariables.replayCamRot.splice(index, 1);

    // Get last camera point tick or 0 if none
    const camTicks = SharedVariables.replayCamPos.map(c => c.tick);
    const lastCamTick = camTicks.length > 0 ? Math.max(...camTicks) : 0;

    // Clamp wantLoadFrameTick to last camera point
    SharedVariables.wantLoadFrameTick = Math.min(SharedVariables.wantLoadFrameTick, lastCamTick);

    removeEntities(player, false);
    saveToDB(player);
    respawnCameraEntities(player);

    player.sendMessage(`§cCamera point ${index + 1} removed.`);
}

import { SharedVariables } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";
import { removeEntities } from "../../functions/removeEntities";
import { saveToDB } from "../../functions/replayControls/save-to-database";
import { respawnCameraEntities } from "../../functions/camera/camera-load-from-database";

export function removeCameraPoint(player: Player, index: number) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    session.replayCamPos.splice(index, 1);
    session.replayCamRot.splice(index, 1);

    // Update startingValueTick to last camera point tick or 0 if none
    if (session.replayCamPos.length > 0) {
        const lastTick = Math.max(...session.replayCamPos.map((c) => c.tick));
        session.startingValueTick = lastTick;
    } else {
        session.startingValueTick = 0;
    }

    removeEntities(player, false);
    saveToDB(player, session);
    respawnCameraEntities(player);
    player.sendMessage(`§cCamera point ${index + 1} removed.`);
}

import { replaySessions } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";
import { removeEntities } from "../../functions/remove-entities";
import { saveToDB } from "../../functions/replayControls/save-to-database";
import { respawnCameraEntities } from "../../functions/camera/camera-load-from-database";

export function removeCameraPoint(player: Player, index: number) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    session.replayCamPos.splice(index, 1);
    session.replayCamRot.splice(index, 1);

    // Get last camera point tick or 0 if none
    const camTicks = session.replayCamPos.map((c) => c.tick);
    const lastCamTick = camTicks.length > 0 ? Math.max(...camTicks) : 0;

    // Clamp wantLoadFrameTick to last camera point
    session.targetFrameTick = Math.min(session.targetFrameTick, lastCamTick);

    removeEntities(player, false);
    saveToDB(player, session);
    respawnCameraEntities(player);

    player.sendMessage(`§cCamera point ${index + 1} removed.`);
}

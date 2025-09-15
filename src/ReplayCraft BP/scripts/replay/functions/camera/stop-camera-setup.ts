import { Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
export function doStopCamera(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage("§c[ReplayCraft] Error: No replay session found for you.");
        return;
    }
    player.camera.clear();
    //player.runCommand(`camera @s clear`);

    const timeOut1Id = session.cameraInitTimeoutsMap.get(player.id);
    timeOut1Id.forEach((timeOut1Id: number) => {
        system.clearRun(timeOut1Id);
    });
    session.cameraInitTimeoutsMap.delete(player.id);

    const timeOut2Id = session.cameraTransitionTimeoutsMap.get(player.id);
    timeOut2Id.forEach((timeOut2Id: number) => {
        system.clearRun(timeOut2Id);
    });
    session.cameraTransitionTimeoutsMap.delete(player.id);
    delete session.currentCamTransitionData;
}

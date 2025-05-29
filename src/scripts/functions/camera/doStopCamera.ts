import { Player, system } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
export function doStopCamera(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage("§c[ReplayCraft] Error: No replay session found for you.");
        return;
    }
    player.camera.clear();
    //player.runCommand(`camera @s clear`);

    const timeOut1Id = session.repCamTout1Map.get(player.id);
    timeOut1Id.forEach((timeOut1Id: number) => {
        system.clearRun(timeOut1Id);
    });
    session.repCamTout1Map.delete(player.id);

    const timeOut2Id = session.repCamTout2Map.get(player.id);
    timeOut2Id.forEach((timeOut2Id: number) => {
        system.clearRun(timeOut2Id);
    });
    session.repCamTout2Map.delete(player.id);
}

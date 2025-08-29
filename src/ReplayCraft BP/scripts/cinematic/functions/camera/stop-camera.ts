import { Player, system } from "@minecraft/server";
import { settingsDataMap, otherDataMap, cameraIntervalMap } from "../../data/maps";

export function stopCamera(player: Player) {
    const otherData = otherDataMap.get(player.id);
    if (!otherData.isCameraInMotion) {
        player.sendMessage({ translate: "dbg.rc2.mes.no.active.camera.movement.to.stop" });
        return;
    }

    const settingsData = settingsDataMap.get(player.id);
    if (settingsData.hideHud === true) {
        player.onScreenDisplay.setHudVisibility(1);
    }

    const intervals = cameraIntervalMap.get(player.id);
    if (intervals) {
        for (const intervalId of intervals) {
            system.clearRun(intervalId);
        }
        cameraIntervalMap.delete(player.id);
    }

    player.camera.clear();
    player.sendMessage({ translate: "dbg.rc2.mes.camera.movement.stopped" });

    otherData.isCameraInMotion = false;
}

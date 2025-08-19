import { Player, system } from "@minecraft/server";
import { settingsDataMap, otherDataMap, cameraIntervalMap } from "../../data/maps";

export function stopCamera(player: Player) {
    const otherData = otherDataMap.get(player.id);
    if (otherData.isCameraInMotion === false) {
        player.sendMessage({
            translate: "dbg.rc2.mes.no.active.camera.movement.to.stop",
        });
        return;
    }
    otherData.isCameraInMotion = false;

    const settingsData = settingsDataMap.get(player.id);
    if (settingsData.hideHud === true) {
        player.onScreenDisplay.setHudVisibility(1);
    }

    if (cameraIntervalMap.has(player.id)) {
        const intervals = cameraIntervalMap.get(player.id);
        intervals.forEach((intervalId: number) => {
            system.clearRun(intervalId);
        });

        player.camera.clear();

        player.sendMessage({ translate: "dbg.rc2.mes.camera.movement.stopped" });
        cameraIntervalMap.delete(player.id);
        otherData.isCameraInMotion = false;
        otherData.isCameraInMotion = false;
    } else {
        player.sendMessage({
            translate: "dbg.rc2.mes.no.active.camera.movement.to.stop",
        });
    }
}

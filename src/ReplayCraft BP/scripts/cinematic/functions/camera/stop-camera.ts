import { Player, system } from "@minecraft/server";
import { settingsDataMap, cineRuntimeDataMap, cameraIntervalMap } from "../../data/maps";
import { refreshAllFrameEntities } from "../entity/refresh-all-frame-entities";
import { CinematicType } from "../../data/types/types";

export function stopCamera(player: Player, cinematicType: CinematicType) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    if (!cineRuntimeData.isCameraInMotion) {
        player.sendMessage({ translate: "rc2.mes.no.active.camera.movement.to.stop" });
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
    player.sendMessage({ translate: "rc2.mes.camera.movement.stopped" });

    cineRuntimeData.isCameraInMotion = false;
    refreshAllFrameEntities(player, cinematicType);
}

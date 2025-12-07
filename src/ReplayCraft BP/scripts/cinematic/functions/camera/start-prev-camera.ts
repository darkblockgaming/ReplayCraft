import { Player, system, EasingType } from "@minecraft/server";
import { frameDataMap, settingsDataMap, cineRuntimeDataMap, cameraIntervalMap } from "../../data/maps";
import { easeTypes } from "../../data/constants/constants";
import { removeAllFrameEntities } from "../entity/remove-all-frame-entities";
import { applyCamera } from "./start-camera";
import { calculateEaseTime } from "./camera-utils";
import { refreshAllFrameEntities } from "../entity/refresh-all-frame-entities";

export function startPreview(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];

    const settingsData = settingsDataMap.get(cineRuntimeData.loadedCinematic);

    if (!settingsData || !cineRuntimeData) {
        player.sendMessage("§cMissing camera settings or state.");
        return;
    }

    if (cineRuntimeData.isCameraInMotion) {
        player.playSound("note.bass");
        player.sendMessage({ translate: "rc2.mes.camera.is.already.moving" });
        return;
    }

    if (frames.length === 0) {
        player.playSound("note.bass");
        player.sendMessage({ translate: "rc2.mes.no.frames.found" });
        return;
    }
    if (frames.length === 1) {
        player.playSound("note.bass");
        player.sendMessage({ translate: "rc2.mes.add.more.frames" });
        return;
    }

    removeAllFrameEntities(player);

    // clear any leftover intervals
    const existing = cameraIntervalMap.get(player.id);
    if (existing) {
        existing.forEach((id) => system.clearRun(id));
    }
    cameraIntervalMap.set(player.id, []);

    const easeTypeKey = easeTypes[settingsData.easeType];
    const easeEnum = EasingType[easeTypeKey as keyof typeof EasingType] ?? EasingType.Linear;

    // place camera at first frame
    applyCamera(player, frames[0].pos, frames[0].rot, settingsData.camFacingType, settingsData);

    let index = 1;
    cineRuntimeData.isCameraInMotion = true;

    function moveNextCameraFrame() {
        if (index < frames.length) {
            const prev = frames[index - 1];
            const next = frames[index];

            // dynamic ease time based on distance
            const segmentEaseTime = calculateEaseTime(prev.pos, next.pos, settingsData.cinePrevSpeed);

            applyCamera(player, next.pos, next.rot, settingsData.camFacingType, settingsData, segmentEaseTime, easeEnum);

            const intervalId = system.runTimeout(() => {
                index++;
                moveNextCameraFrame();
            }, segmentEaseTime * 20);
            cameraIntervalMap.get(player.id)!.push(intervalId);
        } else {
            // last frame cleanup
            const intervalId = system.runTimeout(() => {
                cineRuntimeData.isCameraInMotion = false;
                player.camera.clear();
                refreshAllFrameEntities(player, "path_placement");
            }, 2);
            
            cameraIntervalMap.get(player.id)!.push(intervalId);
        }
    }

    const initialIntervalId = system.runTimeout(() => moveNextCameraFrame(), 5);
    cameraIntervalMap.get(player.id)!.push(initialIntervalId);
}

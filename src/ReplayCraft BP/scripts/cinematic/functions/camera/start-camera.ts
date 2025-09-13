import { Player, system, EasingType, Vector3, Vector2 } from "@minecraft/server";
import { frameDataMap, settingsDataMap, cineRuntimeDataMap, cameraIntervalMap } from "../../data/maps";
import { easeTypes } from "../../data/constants/constants";
import { refreshAllFrameEntities } from "../entity/refresh-all-frame-entities";
import { removeAllFrameEntities } from "../entity/remove-all-frame-entities";
import { calculateEaseTime } from "./camera-utils";

function applyCamera(player: Player, pos: Vector3, rot: Vector2, facingType: number, settingsData: any, easeTime?: number, easeEnum?: EasingType) {
    const base: any = { location: pos };

    if (facingType === 1) {
        base.rotation = { x: settingsData.camFacingX, y: settingsData.camFacingY };
    } else if (facingType === 2) {
        base.facingEntity = player;
    } else {
        base.rotation = rot;
    }

    if (easeTime && easeEnum) {
        base.easeOptions = { easeTime, easeType: easeEnum };
    }

    player.camera.setCamera("minecraft:free", base);
}

export function startCamera(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];
    const settingsData = settingsDataMap.get(player.id);

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

    //remove all frame entities before camera movement
    removeAllFrameEntities(player);

    if (settingsData.hideHud) {
        player.onScreenDisplay.setHudVisibility(0);
    }

    // clear any leftover intervals
    const existing = cameraIntervalMap.get(player.id);
    if (existing) {
        existing.forEach((id) => system.clearRun(id));
    }
    cameraIntervalMap.set(player.id, []);

    //const easeTime = settingsData.easetime || 1;
    const easeTypeKey = easeTypes[settingsData.easeType];
    const easeEnum = EasingType[easeTypeKey as keyof typeof EasingType] ?? EasingType.Linear;

    // place camera at first frame
    applyCamera(player, frames[0].pos, frames[0].rot, settingsData.camFacingType, settingsData);

    let index = 1;
    cineRuntimeData.isCameraInMotion = true;

    // function moveNextCameraFrame() {
    //     if (index < frames.length) {
    //         const next = frames[index];
    //         applyCamera(player, next.pos, next.rot, settingsData.camFacingType, settingsData, easeTime, easeEnum);

    //         const intervalId = system.runTimeout(() => {
    //             index++;
    //             moveNextCameraFrame();
    //         }, easeTime * 20);
    //         cameraIntervalMap.get(player.id)!.push(intervalId);
    //     } else {
    //         // last frame cleanup
    //         const intervalId = system.runTimeout(() => {
    //             player.camera.clear();
    //             if (settingsData.hideHud) {
    //                 player.onScreenDisplay.setHudVisibility(1);
    //             }
    //             player.sendMessage({ translate: "rc2.mes.camera.movement.complete" });
    //             refreshAllFrameEntities(player);
    //             cineRuntimeData.isCameraInMotion = false;
    //         }, 10);
    //         cameraIntervalMap.get(player.id)!.push(intervalId);
    //     }
    // }

    // start moving after small delay

    function moveNextCameraFrame() {
        if (index < frames.length) {
            const prev = frames[index - 1];
            const next = frames[index];

            // dynamic ease time based on distance
            const segmentEaseTime = calculateEaseTime(prev.pos, next.pos, settingsData.camSpeed || 2);

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
                if (settingsData.hideHud) {
                    player.onScreenDisplay.setHudVisibility(1);
                }
                player.sendMessage({ translate: "rc2.mes.camera.movement.complete" });
                refreshAllFrameEntities(player);
            }, 10);
            cameraIntervalMap.get(player.id)!.push(intervalId);
        }
    }

    const initialIntervalId = system.runTimeout(() => moveNextCameraFrame(), 5);
    cameraIntervalMap.get(player.id)!.push(initialIntervalId);
}

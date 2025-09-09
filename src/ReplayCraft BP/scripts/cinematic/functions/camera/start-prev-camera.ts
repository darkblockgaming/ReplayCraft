import { Player, system, EasingType } from "@minecraft/server";
import { frameDataMap, settingsDataMap, cineRuntimeDataMap, cameraIntervalMap } from "../../data/maps";
import { easeTypes } from "../../data/constants/constants";
import { FrameData } from "../../data/types/types";
import { removeAllFrameEntities } from "../entity/remove-all-frame-entities";
import { refreshAllFrameEntities } from "../entity/refresh-all-frame-entities";

export function startPreview(player: Player) {
    const frames = frameDataMap.get(player.id) ?? [];
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const settingsData = settingsDataMap.get(player.id);

    if (!settingsData || !cineRuntimeData) {
        player.sendMessage("§cMissing camera settings or state.");
        return;
    }

    if (cineRuntimeData.isCameraInMotion) {
        player.playSound("note.bass");
        player.sendMessage({ translate: "dbg.rc2.mes.camera.is.already.moving" });
        return;
    }

    if (frames.length === 0) {
        player.playSound("note.bass");
        player.sendMessage({ translate: "dbg.rc2.mes.no.frames.found" });
        return;
    }
    if (frames.length === 1) {
        player.playSound("note.bass");
        player.sendMessage({ translate: "dbg.rc2.mes.add.more.frames" });
        return;
    }

    removeAllFrameEntities(player);

    const easeTime = settingsData.cinePrevSpeed;
    const easeTypeKey = easeTypes[settingsData.easeType];
    const easeEnum = EasingType[easeTypeKey as keyof typeof EasingType] ?? EasingType.Linear;

    // Clear any old intervals
    const existing = cameraIntervalMap.get(player.id);
    if (existing) {
        existing.forEach(id => system.clearRun(id));
    }
    cameraIntervalMap.set(player.id, []);

    // start at frame 0
    player.camera.setCamera("minecraft:free", {
        location: frames[0].pos,
        rotation: frames[0].rot,
    });

    cineRuntimeData.isCameraInMotion = true;

    function moveNextCameraFrame(player: Player, frames: FrameData[], index: number) {
        if (index >= frames.length) {
            refreshAllFrameEntities(player);
            player.camera.clear();
            cineRuntimeData.isCameraInMotion = false;
            return;
        }

        const frame = frames[index];
        player.camera.setCamera("minecraft:free", {
            location: frame.pos,
            rotation: frame.rot,
            easeOptions: { easeTime, easeType: easeEnum },
        });

        const intervalId = system.runTimeout(() => {
            moveNextCameraFrame(player, frames, index + 1);
        }, easeTime * 20);

        cameraIntervalMap.get(player.id)!.push(intervalId);
    }

    // start transition from frame 1
    moveNextCameraFrame(player, frames, 1);
}

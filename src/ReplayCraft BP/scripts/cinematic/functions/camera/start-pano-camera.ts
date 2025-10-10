import { EasingType, Player, system, world } from "@minecraft/server";
import { frameDataMap, settingsDataMap, cineRuntimeDataMap, cameraIntervalMap } from "../../data/maps";

import { removeAllFrameEntities } from "../entity/remove-all-frame-entities";

export function startPanoramicCamera(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const frames = frameDataMap.get(cineRuntimeData?.loadedCinematic ?? "") ?? [];
    const settingsData = settingsDataMap.get(player.id);

    if (!settingsData || !cineRuntimeData) {
        player.sendMessage("§cMissing camera settings or state.");
        return;
    }

    const anchorPoint = frames[0];
    if (!anchorPoint) return;

    removeAllFrameEntities(player);

    if (settingsData.hideHud) {
        player.onScreenDisplay.setHudVisibility(0);
    }

    cineRuntimeData.isCameraInMotion = true;

    // clear any leftover intervals
    const existing = cameraIntervalMap.get(player.id);
    if (existing) existing.forEach((id) => system.clearRun(id));
    cameraIntervalMap.set(player.id, []);

    player.camera.setCamera("minecraft:free", {
        location: anchorPoint.pos,
        rotation: anchorPoint.rot,
        
    });

    player.camera.setCamera("minecraft:free", {
        location: anchorPoint.pos,
        rotation: {
            x: anchorPoint.rot.x,
            y: -(anchorPoint.rot.y + 0.1),
        },
        easeOptions: {
            easeTime: 6,
            easeType: EasingType.Linear
        }
    });

    let rotationY = 0; // starting rotation Y
    const intervalId = system.runInterval(() => {
        rotationY += 2; // rotate 2° per tick (adjust speed as needed)
        if (rotationY >= 360) rotationY = 0;
    }, 1);

    world.sendMessage(`x: ${anchorPoint.rot.x}`);
    world.sendMessage(`y: ${anchorPoint.rot.y}`);

    cameraIntervalMap.get(player.id)!.push(intervalId);
}

import { Player, EasingType, system } from "@minecraft/server";
import { frameDataMap, cineRuntimeDataMap, cameraIntervalMap, settingsDataMap } from "../../data/maps";
import { removeAllFrameEntities } from "../entity/remove-all-frame-entities";

const DEFAULT_STEP_ANGLE = 90; // degrees per eased segment (90° -> 4 segments per full spin)

/**
 * Start an infinite vertical panoramic camera.
 * @param player Player to apply camera to
 */
export function startPanoramicCamera(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const frames = frameDataMap.get(cineRuntimeData?.loadedCinematic ?? "") ?? [];
    const settingsData = settingsDataMap.get(player.id);

    if (!cineRuntimeData || !settingsData) return;

    const anchorPoint = frames[0];
    if (!anchorPoint) return;

    removeAllFrameEntities(player);

    // clear previous scheduled runs for this player
    const existing = cameraIntervalMap.get(player.id);
    if (existing) existing.forEach((id) => system.clearRun(id));
    cameraIntervalMap.set(player.id, []);

    cineRuntimeData.isCameraInMotion = true;

    const rpm = settingsData.panoRPM ?? 8;
    const rotationType = settingsData.panoRotationType ?? "clockwise"; // "clockwise" or "anticlockwise"

    const desiredPitch = anchorPoint.rot.x ?? 0;
    let currentYaw = anchorPoint.rot.y ?? 0;

    // Place initial camera
    player.camera.setCamera("minecraft:free", {
        location: anchorPoint.pos,
        rotation: { x: desiredPitch, y: currentYaw },
    });

    // Time per step calculation
    const timePerStep = (DEFAULT_STEP_ANGLE / 360) * (60 / rpm);

    const rotateStep = () => {
        // Change direction based on rotation type
        currentYaw += rotationType === "clockwise" ? DEFAULT_STEP_ANGLE : -DEFAULT_STEP_ANGLE;

        // Wrap into [-180, 180]
        if (currentYaw > 180) currentYaw -= 360;
        if (currentYaw <= -180) currentYaw += 360;

        // Apply eased rotation
        player.camera.setCamera("minecraft:free", {
            location: anchorPoint.pos,
            rotation: { x: desiredPitch, y: currentYaw },
            easeOptions: {
                easeTime: timePerStep,
                easeType: EasingType.Linear,
            },
        });

        const timeoutId = system.runTimeout(rotateStep, Math.max(1, Math.round(timePerStep * 20)));
        cameraIntervalMap.get(player.id)!.push(timeoutId);
    };

    // kickoff
    rotateStep();
}

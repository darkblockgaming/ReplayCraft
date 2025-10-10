import { Player, EasingType, system } from "@minecraft/server";
import { frameDataMap, cineRuntimeDataMap, cameraIntervalMap } from "../../data/maps";
import { removeAllFrameEntities } from "../entity/remove-all-frame-entities";


const PANORAMIC_EASING = EasingType.Linear; // linear easing as requested
const DEFAULT_RPM = 1000000;                       // rotations per minute (default)
const DEFAULT_STEP_ANGLE = 36;               // degrees per eased segment (36° -> 10 segments per full spin)
const MIN_PITCH = -90;
const MAX_PITCH = 90;
// ----------------------------

function clamp(v: number, a: number, b: number) {
    return Math.max(a, Math.min(b, v));
}

/**
 * Start an infinite vertical panoramic camera.
 * @param player Player to apply camera to
 * @param pitchOverride Optional pitch in degrees (-90..90). If omitted, uses the frame's pitch.
 * @param rpmOverride Optional rotations per minute override.
 * @param stepAngleOverride Optional step angle (degrees per eased segment).
 */
export function startPanoramicCamera(
    player: Player,
    pitchOverride?: number,
    rpmOverride?: number,
    stepAngleOverride?: number
) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const frames = frameDataMap.get(cineRuntimeData?.loadedCinematic ?? "") ?? [];

    if (!cineRuntimeData) {
        player.sendMessage("§cMissing cinematic runtime state.");
        return;
    }

    const anchorPoint = frames[0];
    if (!anchorPoint) {
        player.sendMessage("§cNo frames found for panoramic view.");
        return;
    }

    removeAllFrameEntities(player);

    // clear previous scheduled runs for this player
    const existing = cameraIntervalMap.get(player.id);
    if (existing) existing.forEach((id) => system.clearRun(id));
    cameraIntervalMap.set(player.id, []);

    cineRuntimeData.isCameraInMotion = true;

    // Effective parameters
    const rpm = (typeof rpmOverride === "number" && rpmOverride > 0) ? rpmOverride : DEFAULT_RPM;
    const stepAngle = (typeof stepAngleOverride === "number" && stepAngleOverride > 0)
        ? stepAngleOverride
        : DEFAULT_STEP_ANGLE;

    // Pitch: use override if provided, else frame pitch. Clamp to [-90, 90].
    const desiredPitch = clamp(
        (typeof pitchOverride === "number") ? pitchOverride : Math.round(anchorPoint.rot.x),
        MIN_PITCH,
        MAX_PITCH
    );

    // Start yaw from the frame's yaw, rounded to an integer to avoid small float jitter.
    let currentYaw = Math.round(anchorPoint.rot.y);

    // Place camera initially (anchor position + chosen pitch + starting yaw)
    player.camera.setCamera("minecraft:free", {
        location: anchorPoint.pos,
        rotation: { x: desiredPitch, y: currentYaw }
    });

    // Time per step calculation (seconds)
    // 1 rotation = 360 deg -> time per rotation = 60 / rpm seconds
    // step fraction = stepAngle / 360
    const timePerStep = (stepAngle / 360) * (60 / rpm);

    // The main function that schedules the next eased yaw change.
    const rotateStep = () => {
        currentYaw += stepAngle;
        // Wrap into [-180, 180]
        if (currentYaw > 180) currentYaw -= 360;
        if (currentYaw <= -180) currentYaw += 360;

        // Set camera to same position, pitch fixed, yaw changed with linear easing
        player.camera.setCamera("minecraft:free", {
            location: anchorPoint.pos,
            rotation: { x: desiredPitch, y: currentYaw },
            easeOptions: {
                easeTime: timePerStep,
                easeType: PANORAMIC_EASING
            }
        });

        // schedule next step
        const timeoutId = system.runTimeout(rotateStep, Math.max(1, Math.round(timePerStep * 20)));
        cameraIntervalMap.get(player.id)!.push(timeoutId);
    };

    // kickoff
    rotateStep();
}


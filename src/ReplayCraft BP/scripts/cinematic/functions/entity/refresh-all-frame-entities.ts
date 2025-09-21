import { Player, world, Vector3 } from "@minecraft/server";
import { cineRuntimeDataMap, frameDataMap } from "../../data/maps";
import { spawnFrameEntity } from "../entity/spawn-frame-entity";
import { cinematicFramesDB } from "../../cinematic";

const TOLERANCE = 0.01;

/**
 * Compare two positions with a tolerance
 */
function isSamePosition(a: Vector3, b: Vector3, tolerance = TOLERANCE): boolean {
    return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance && Math.abs(a.z - b.z) <= tolerance;
}

/**
 * Compare two rotations with a tolerance
 */
function isSameRotation(a: { x: number; y: number }, b: { x: number; y: number }, tolerance = TOLERANCE): boolean {
    return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
}

export async function refreshAllFrameEntities(player: Player, isFocusPoint: boolean = false) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    if (cineRuntimeData?.isCameraInMotion) return;

    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic);
    if (!frames || frames.length === 0) return;

    frames.forEach((frame, index) => {
        const entity = world.getEntity(frame.entityId);

        // Case 1: entity missing → respawn
        if (!entity) {
            const newEntity = spawnFrameEntity(player, frame.pos, frame.rot, index, isFocusPoint);
            frame.entityId = newEntity.id;
            frames[index] = frame;
            return;
        }

        // Case 2: entity exists but is out of sync → remove & respawn
        if (!isSamePosition(entity.location, frame.pos) || !isSameRotation(entity.getRotation(), frame.rot)) {
            entity.remove();
            const newEntity = spawnFrameEntity(player, frame.pos, frame.rot, index, isFocusPoint);
            frame.entityId = newEntity.id;
            frames[index] = frame;
        }
        // Case 3: entity matches → do nothing
    });
    frameDataMap.set(cineRuntimeData.loadedCinematic, frames);
    cinematicFramesDB.set(cineRuntimeData.loadedCinematic, frames);
}

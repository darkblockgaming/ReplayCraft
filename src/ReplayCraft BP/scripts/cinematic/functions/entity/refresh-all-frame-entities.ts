import { Player, world,  Vector3 } from "@minecraft/server";
import { frameDataMap } from "../../data/maps";
import { spawnFrameEntity } from "../entity/spawn-frame-entity";

const TOLERANCE = 0.01;

/**
 * Compare two positions with a tolerance
 */
function isSamePosition(a: Vector3, b: Vector3, tolerance = TOLERANCE): boolean {
    return (
        Math.abs(a.x - b.x) <= tolerance &&
        Math.abs(a.y - b.y) <= tolerance &&
        Math.abs(a.z - b.z) <= tolerance
    );
}

/**
 * Compare two rotations with a tolerance
 */
function isSameRotation(a: { x: number; y: number }, b: { x: number; y: number }, tolerance = TOLERANCE): boolean {
    return (
        Math.abs(a.x - b.x) <= tolerance &&
        Math.abs(a.y - b.y) <= tolerance
    );
}

export function refreshAllFrameEntities(player: Player) {
    const frames = frameDataMap.get(player.id);
    if (!frames || frames.length === 0) return;

    frames.forEach((frame, index) => {
        const entity = world.getEntity(frame.entityId);

        // Case 1: entity missing → respawn
        if (!entity) {
            const newEntity = spawnFrameEntity(player, frame.pos, frame.rot, index);
            frame.entityId = newEntity.id;
            return;
        }

        // Case 2: entity exists but is out of sync → remove & respawn
        if (!isSamePosition(entity.location, frame.pos) || !isSameRotation(entity.getRotation(), frame.rot)) {
            entity.remove();
            const newEntity = spawnFrameEntity(player, frame.pos, frame.rot, index);
            frame.entityId = newEntity.id;
        }

        // Case 3: entity matches → do nothing
    });
}


import { Entity } from "@minecraft/server";

export function getElytraGlideRatio(entity: Entity) {
    const vel = entity.getVelocity();
    const dz = vel.z;

    let ratio = 1;
    if (dz < 0) {
        // movement_direction ~ velocity.z normalized (simplified here)
        const movementDirZ = dz;
        ratio = 1 - Math.pow(-movementDirZ, 1.5);
    }

    // Clamp between 0 and 1
    ratio = Math.max(0, Math.min(1, ratio));

    return ratio;
}

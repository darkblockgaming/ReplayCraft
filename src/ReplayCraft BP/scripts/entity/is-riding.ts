import { Entity, Player } from "@minecraft/server";

/**
 * Returns true if the player is currently riding another entity.
 */
export function isPlayerRiding(player: Player): boolean {
    const ridingComponent = player.getComponent("minecraft:riding");

    return ridingComponent !== undefined;
}

export function getRiddenEntity(player: Player): Entity | undefined {
    if (!player.getComponent("minecraft:riding")) {
        // Player not riding anything
        return undefined;
    }

    // Get all entities in a small radius around player, exclude players
    const nearbyEntities = player.dimension.getEntities({
        location: player.location,
        maxDistance: 1.5, // small radius
        excludeTypes: ["player"],
    });

    if (nearbyEntities.length === 0) return undefined;

    // Return the closest entity to the player (likely the ridden entity)
    nearbyEntities.sort((a, b) => {
        const da = distanceSquared(player.location, a.location);
        const db = distanceSquared(player.location, b.location);
        return da - db;
    });

    return nearbyEntities[0];
}

function distanceSquared(loc1: { x: number; y: number; z: number }, loc2: { x: number; y: number; z: number }): number {
    return (loc1.x - loc2.x) * (loc1.x - loc2.x) + (loc1.y - loc2.y) * (loc1.y - loc2.y) + (loc1.z - loc2.z) * (loc1.z - loc2.z);
}

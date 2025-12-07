import { Vector3 } from "@minecraft/server";

export function getDistance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function calculateEaseTime(a: Vector3, b: Vector3, speed: number): number {
    return getDistance(a, b) / speed;
}

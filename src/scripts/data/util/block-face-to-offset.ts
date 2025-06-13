import { Vector3 } from "@minecraft/server";

/**
 * Returns a direction vector (offset) corresponding to a block face.
 * @param face Direction string from `blockFace` ("up", "down", etc.)
 */
export function getOffsetFromBlockFace(face: string): Vector3 {
    switch (face) {
        case "down":
            return { x: 0, y: -1, z: 0 };
        case "up":
            return { x: 0, y: 1, z: 0 };
        case "north":
            return { x: 0, y: 0, z: -1 };
        case "south":
            return { x: 0, y: 0, z: 1 };
        case "west":
            return { x: -1, y: 0, z: 0 };
        case "east":
            return { x: 1, y: 0, z: 0 };
        default:
            return { x: 0, y: 0, z: 0 };
    }
}

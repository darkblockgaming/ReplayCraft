import { Vector3 } from "@minecraft/server";

export function getSimulatedElytraRatio(recordedPositions: Vector3[], currentTick: number): number {
    if (currentTick < 1 || currentTick >= recordedPositions.length) return 1;

    const prev = recordedPositions[currentTick - 1];
    const curr = recordedPositions[currentTick];

    const deltaZ = curr.z - prev.z;

    let ratio = 1;
    if (deltaZ < 0) {
        ratio = 1 - Math.pow(-deltaZ, 1.5);
    }

    return Math.max(0, Math.min(1, ratio));
}

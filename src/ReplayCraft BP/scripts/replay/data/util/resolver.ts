import { Vector2, Vector3 } from "@minecraft/server";
import { PlayerActionsDataV2 } from "../../classes/types/types";

export function resolveFlagsAtTick(data: PlayerActionsDataV2, tick: number): number {
    let flags = 0;
    for (const [t, v] of data.flags) {
        if (t <= tick) flags = v;
        else break;
    }
    return flags;
}

export function resolveRidingTypeAtTick(data: PlayerActionsDataV2, tick: number): string | null {
    let ridingType: string | null = null;
    for (const [t, v] of data.ridingTypeId) {
        if (t <= tick) ridingType = v;
        else break;
    }
    return ridingType;
}
export function vectorsEqual(a: Vector3, b: Vector3): boolean {
    return a.x === b.x && a.y === b.y && a.z === b.z;
}
export function vectorsEqual2(a: Vector2, b: Vector2): boolean {
    return a.x === b.x && a.y === b.y;
}
export function findLastTick(map: Map<number, any>, tick: number): number | undefined {
    let last: number | undefined;
    for (const t of map.keys()) {
        if (t <= tick) last = t;
        else break;
    }
    return last;
}
/**
 * Finds the closest recorded tick ≤ targetTick.
 */
export function findLastRecordedTick<T>(map: Map<number, T>, targetTick: number): number | null {
    let closestTick: number | null = null;
    for (const tick of map.keys()) {
        if (tick <= targetTick && (closestTick === null || tick > closestTick)) {
            closestTick = tick;
        }
    }
    return closestTick;
}

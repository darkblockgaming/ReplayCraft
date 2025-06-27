import { safeSet } from "../main";

export function smoothSafeSet(entityData: any, key: string, targetValue: number, rate = 0.05, forceReset = false) {
    const progressKey = `_progress_${key}`;
    const data = entityData;

    // Initialize progress if undefined
    if (typeof data[progressKey] !== "number") {
        data[progressKey] = targetValue > 0 ? 0 : 1;
    }

    // Force reset progress to 0 if requested and target > 0 (e.g. swimming start)
    if (forceReset && targetValue > 0) {
        data[progressKey] = 0;
    }

    // Smoothly move progress toward target
    const current = data[progressKey];
    const diff = targetValue - current;

    if (Math.abs(diff) < rate) {
        data[progressKey] = targetValue;
    } else {
        data[progressKey] += rate * Math.sign(diff);
    }

    // Apply the interpolated value
    safeSet(entityData.customEntity, key, data[progressKey]);

    return data[progressKey];
}
export function smoothTransitionTick(key: string, entityData: any, isActive: boolean, step = 0.1) {
    const internalKey = `_progress_${key}`;
    if (typeof entityData[internalKey] !== "number") {
        entityData[internalKey] = 0;
    }

    // Update progress
    entityData[internalKey] += isActive ? step : -step;
    entityData[internalKey] = Math.max(0, Math.min(1, entityData[internalKey]));

    // Set to customEntity
    safeSet(entityData.customEntity, key, entityData[internalKey]);
}

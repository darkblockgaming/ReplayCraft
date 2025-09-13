import { Vector3, Vector2 } from "@minecraft/server";

export interface CineRuntimeData {
    state: string;
    isCameraInMotion: boolean;
    loadedCinematic?: string;
}

export interface FrameData {
    pos: Vector3;
    rot: Vector2;
    entityId: string;
}

export interface SettingsData {
    hideHud: boolean;
    easeType: number;
    camSpeed: number;
    camFacingType: number;
    camFacingX: number;
    camFacingY: number;
    cinePrevSpeed: number;
    cinePrevSpeedMult: number;
}

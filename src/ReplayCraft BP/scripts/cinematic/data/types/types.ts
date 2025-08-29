import { Vector3, Vector2 } from "@minecraft/server";

export interface uiState {
    state: string;
}

export interface FrameData {
    pos: Vector3;
    rot: Vector2;
    entityId: string;
}

export interface SettingsData {
    hideHud: boolean;
    easeType: number;
    easetime: number;
    camFacingType: number;
    camFacingX: number;
    camFacingY: number;
    cinePrevSpeed: number;
    cinePrevSpeedMult: number;
}

export interface OtherData {
    isCameraInMotion: boolean;
}

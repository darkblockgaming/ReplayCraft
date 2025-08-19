import { Vector3, Vector2 } from "@minecraft/server";

export interface FrameData {
    pos: Vector3;
    rot: Vector2;
    entityId?: string; //If we summon entity to represent the frame instead of particle
}

export interface SettingsData {
    hideHud: boolean;
    easeType: number;
    easetime: number;
    camFacingType: number;
    camFacingX: number;
    camFacingY: number;
    cineParType: number;
    cinePrevSpeed: number;
    cineParSwitch: boolean;
    cinePrevSpeedMult: number;
    cineFadeSwitch: boolean;
    cineRedValue: number;
    cineGreenValue: number;
    cineBlueValue: number;
}

export interface OtherData {
    isCameraInMotion: boolean;
    retrievedData: boolean;
    retrievedSett: boolean;
}

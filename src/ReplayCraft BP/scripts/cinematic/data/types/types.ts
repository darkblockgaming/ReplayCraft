import { Vector3, Vector2 } from "@minecraft/server";

export type CinematicType = "none" | "path_placement" | "panoramic" | "orbital";

export interface CineRuntimeData {
    state: string;
    isCameraInMotion: boolean;
    loadedCinematic?: string;
    loadedCinematicType: CinematicType;
}

export interface CinematicBasicData {
    name: string;
    type: CinematicType
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


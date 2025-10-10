import { CinematicBasicData, CineRuntimeData, FrameData, SettingsData, } from "./types/types";

export const cineRuntimeDataMap: Map<string, CineRuntimeData> = new Map();
export const cameraIntervalMap: Map<string, number[]> = new Map();

export const cinematicListMap: Map<string, CinematicBasicData[]> = new Map();
export const frameDataMap: Map<string, FrameData[]> = new Map();
export const settingsDataMap: Map<string, SettingsData> = new Map();

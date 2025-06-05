import { Entity, Player, Vector2, Vector3 } from "@minecraft/server";
import { ReplayStateMachine } from "../replayStateMachine";
import { PlayerReplaySession } from "../../data/replay-player-session";

export interface BlockData {
    location: { x: number; y: number; z: number };
    typeId: string;
    states: Record<string, any>;
    thisPart?: BlockData;
    lowerPart?: BlockData;
    upperPart?: BlockData;
    otherPart?: BlockData;
}
export interface PlayerBlockData {
    blockStateChanges: Record<string, BlockData>;
}
export interface twoPartBlocks {
    lowerPart: BlockData;
    upperPart: BlockData;
    thisPart?: BlockData;
    otherPart?: BlockData;
}
export type BlockInteractionEntry = BlockData | twoPartBlocks;
export interface PlayerBlockInteractionData {
    blockSateAfterInteractions: Record<number, BlockInteractionEntry>;
}
export interface PlayerBlockInteractionBeforeData {
    blockStateBeforeInteractions: Record<number, BlockInteractionEntry>;
}
export interface PlayerPositionData {
    dbgRecPos: Vector3[];
}
export interface PlayerRotationData {
    dbgRecRot: Vector2[];
}
export interface PlayerActionsData {
    isSneaking: number[];
    isSwimming: number[];
    isClimbing: number[];
    isFalling: number[];
    isFlying: number[];
    isGliding: number[];
    isRiding: number[];
    isSprinting: number[];
    isSleeping: number[];
}
export interface PlaybackEntityData {
    customEntity: Entity;
}
export interface PlayerEquipmentData {
    weapon1: string[]; // Mainhand
    weapon2: string[]; // Offhand
    armor1: string[]; // Head
    armor2: string[]; // Chest
    armor3: string[]; // Legs
    armor4: string[]; // Feet
}
//--------------------------------------------------------------------------------------------------------------//
//Global variables types.
export type SharedVariablesType = {
    soundIds: string[];
    easeTypes: string[];
    skinTypes: string[];
    dbgRecController?: Player;
    dbgRecTime: number;
    replayStateMachine: ReplayStateMachine;
    multiPlayers: Player[];
    multiToggle: boolean;
    replayBDataMap: Map<string, PlayerBlockData>; //Block Related Data (After placing/breaking)
    replayBDataBMap: Map<any, any>;
    replayBData1Map: Map<any, any>;
    replayPosDataMap: Map<any, any>;
    replayRotDataMap: Map<any, any>;
    replayMDataMap: Map<any, any>;
    replayODataMap: Map<any, any>;
    replaySDataMap: Map<any, any>;
    twoPartBlocks: string[];
    toggleSound: boolean;
    selectedSound: number;
    wantLoadFrameTick: number;
    frameLoaded: boolean;
    startingValueTick: number;
    replayCamPos: any[];
    replayCamRot: any[];
    soundCue: boolean;
    textPrompt: boolean;
    startingValueSecs: number;
    startingValueMins: number;
    startingValueHrs: number;
    repCamTout1Map: Map<any, any>;
    repCamTout2Map: Map<any, any>;
    settCameraType: number;
    replayCamEase: number;
    settReplayType: number;
    followCamSwitch: boolean;
    chosenReplaySkin: number;
    settNameType: number;
    settCustomName: string;
    currentSwitch: boolean;
    lilTick: number;
    replaySpeed: number;
    dbgCamFocusPlayer?: Player;
    dbgCamAffectPlayer: Player[];
    topDownCamSwitch: boolean;
    topDownCamSwitch2: boolean;
    topDownCamHight: number;
    focusPlayerSelection: number;
    affectCameraSelection: number;
    buildName: string;
    hideHUD: boolean;
    showCameraSetupUI: boolean;
    currentEditingCamIndex: number;
    useFullRecordingRange: boolean;
    playerSessions: Map<string, PlayerReplaySession>;
};

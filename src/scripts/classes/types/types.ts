import { Player } from "@minecraft/server";
import { ReplayStateMachine } from "../replayStateMachine";

// Define the structure for block data
export interface BlockData {
    location: { x: number; y: number; z: number };
    typeId: string;
    states: Record<string, any>;
    thisPart?: BlockData;
    lowerPart?: BlockData;
    upperPart?: BlockData;
    otherPart?: BlockData;
    
  }

  // Define the structure for block data
export interface BlockData {
  location: { x: number; y: number; z: number };  // Top-level location
  typeId: string; // Top-level typeId
  states: Record<string, any>; // Top-level states
  thisPart?: BlockData;  // Can be used for the part of the block (if any)
  lowerPart?: BlockData; // Used for the lower part of the block (like a door's bottom)
  upperPart?: BlockData; // Used for the upper part of the block (like a door's top)
  otherPart?: BlockData; // Optional other parts if needed
}
  
  // Define the structure stored under each player ID
  export interface PlayerBlockData {
    dbgBlockData: Record<string, BlockData>;
  }

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
      choosenReplaySkin: number;
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
  };
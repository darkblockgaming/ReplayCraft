import { Player, Vector3 } from "@minecraft/server";
import { ReplayStateMachine } from "../classes/replayStateMachine";
import { PlayerBlockData, PlayerBlockInteractionData, PlayerBlockInteractionBeforeData, PlayerPositionData, PlayerRotationData, PlayerActionsData, PlaybackEntityData, PlayerEquipmentData } from "../classes/types/types";

export interface PlayerReplaySession {
    playerName: string;
    soundIds: string[];
    easeTypes: string[];
    skinTypes: string[];
    dbgRecController?: Player;
    dbgRecTime: number;
    replayStateMachine: ReplayStateMachine;
    multiPlayers: Player[];
    multiToggle: boolean;
    replayBlockStateMap: Map<string, PlayerBlockData>; //was replayBDataMap: Block Related Data (After placing/breaking)
    replayBDataBMap: Map<string, PlayerBlockInteractionData>; //was replayBDataBMap: Block Interaction Data (AfterEvent)
    replayBData1Map: Map<string, PlayerBlockInteractionBeforeData>; //was replayBData1Map: Block Interaction Data (BeforeEvent)
    replayPosDataMap: Map<string, PlayerPositionData>; //was replayPosDataMap: Player Position Data
    replayRotDataMap: Map<string, PlayerRotationData>; //was replayRotDataMap: Player Rotation Data
    replayMDataMap: Map<string, PlayerActionsData>; //was replayMDataMap: Player Actions Data
    replayODataMap: Map<string, PlaybackEntityData>; //was replayODataMap: Playback Entity Data
    replaySDataMap: Map<string, PlayerEquipmentData>; //was replaySDataMap: Player Armor/Weapons Data
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
    dbgBlockData: Record<
        number,
        {
            location: Vector3;
            typeId: string;
            states: Record<string, boolean | number | string>;
        }
    >;
    dbgBlockData1: Record<
        number,
        {
            location: Vector3;
            typeId: string;
            states: Record<string, boolean | number | string>;
        }
    >;
}

export let replaySessions = {
    playerSessions: new Map<string, PlayerReplaySession>(),
};

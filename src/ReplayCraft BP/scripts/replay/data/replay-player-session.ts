import { Player, Vector3 } from "@minecraft/server";
import { ReplayStateMachine } from "../classes/replay-state-machine";
import {
    PlayerBlockData,
    PlayerBlockInteractionData,
    PlayerBlockInteractionBeforeData,
    PlayerPositionData,
    PlayerRotationData,
    PlayerActionsData,
    PlaybackEntityData,
    PlayerEquipmentData,
    AmbientEntityData,
    PlayerDamageData,
    itemUseData,
} from "../classes/types/types";

export interface PlayerReplaySession {
    /**
     * @param playerName? - The name of the player who is controlling the replay session.
     */
    playerName: string;
    soundIds: string[];
    easeTypes: string[];
    skinTypes: string[];
    /**
     * @param replayController? - The player who is controlling the replay.
     */
    replayController?: Player;
    /**
     * @param recordingEndTick - The tick at which the recording ends. This is used to determine the duration of the replay.
     */
    recordingEndTick: number;
    /**
     * @param replayStateMachine - an instance of ReplayStateMachine that manages the state of the replay session.
     */
    replayStateMachine: ReplayStateMachine;
    /**
     * @param trackedPlayers - an array of Player objects that are being tracked in the replay session.
     * This will always contain the replayController(Player), if multiPlayerReplayEnabled is set to false.
     * If multiPlayerReplayEnabled is set to true, this will contain all players that were added to this replay session at the main menu.
     */
    trackedPlayers: Player[];
    /**
     * @param multiPlayerReplayEnabled - A boolean indicating whether the replay session is in multiplayer mode.
     * If true, multiple players can be tracked in the replay session.
     */
    multiPlayerReplayEnabled: boolean;
    replayBlockStateMap: Map<string, PlayerBlockData>; //was replayBDataMap: Block Related Data (After placing/breaking)
    replayBlockInteractionAfterMap: Map<string, PlayerBlockInteractionData>; //was replayBDataBMap: Block Interaction Data (AfterEvent)
    replayBlockInteractionBeforeMap: Map<string, PlayerBlockInteractionBeforeData>; //was replayBData1Map: Block Interaction Data (BeforeEvent)
    replayPositionDataMap: Map<string, PlayerPositionData>; //was replayPosDataMap: Player Position Data
    replayRotationDataMap: Map<string, PlayerRotationData>; //was replayRotDataMap: Player Rotation Data
    replayActionDataMap: Map<string, PlayerActionsData>; //was replayMDataMap: Player Actions Data
    replayEntityDataMap: Map<string, PlaybackEntityData>; //was replayODataMap: Playback Entity Data
    replayEquipmentDataMap: Map<string, PlayerEquipmentData>; //was replaySDataMap: Player Armor/Weapons Data
    replayAmbientEntityMap: Map<string, Map<string, AmbientEntityData>>;
    allRecordedPlayerIds: Set<string>; //Used for playback to ensure all players are tracked
    trackedPlayerJoinTicks: Map<string, { joinTick: number; name: string }>; // Maps player IDs to the tick they joined the session
    playerDamageEventsMap: Map<string, PlayerDamageData[]>;
    playerItemUseDataMap: Map<string, itemUseData[]>;
    twoPartBlocks: string[];
    toggleSound: boolean;
    selectedSound: number;
    targetFrameTick: number;
    frameLoaded: boolean;
    startingValueTick: number;
    replayCamPos: any[];
    replayCamRot: any[];
    soundCue: boolean;
    textPrompt: boolean;
    startingValueSecs: number;
    startingValueMins: number;
    startingValueHrs: number;
    cameraInitTimeoutsMap: Map<any, any>; //Temporary storage for camera initialization timeouts
    cameraTransitionTimeoutsMap: Map<any, any>; //Temporary storage for camera transition timeouts
    settingCameraType: number;
    replayCamEase: number;
    settingReplayType: number;
    isFollowCamActive: boolean;
    chosenReplaySkin: number;
    settingNameType: number;
    settingCustomName: string;
    isReplayActive: boolean;
    currentTick: number;
    replaySpeed: number;
    cameraFocusPlayer?: Player;
    cameraAffectedPlayers: Player[];
    isTopDownFixedCamActive: boolean;
    isTopDownDynamicCamActive: boolean;
    topDownCamHight: number;
    focusPlayerSelection: number;
    affectCameraSelection: number;
    buildName: string;
    hideHUD: boolean;
    playbackHUD: {
        isVisible: boolean;
        compactMode: boolean;
        elementToUse: number;
    };
    currentCamTransitionData: {
        fromIndex: number;
        toIndex: number;
        startTick: number;
        endTick: number;
        easeTime: number;
        speedBPS: number;
    };
    showCameraSetupUI: boolean;
    currentEditingCamIndex: number;
    useFullRecordingRange: boolean;
    blockAfterEventData: Record<
        number,
        {
            location: Vector3;
            typeId: string;
            states: Record<string, boolean | number | string>;
        }
    >;
    blockBeforeEventData: Record<
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

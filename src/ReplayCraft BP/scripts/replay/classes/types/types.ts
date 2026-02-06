import { Entity, ItemStack, Vector2, Vector3 } from "@minecraft/server";

export interface BlockData {
    location: { x: number; y: number; z: number };
    typeId: string;
    states: Record<string, any>;
    thisPart?: BlockData;
    lowerPart?: BlockData;
    upperPart?: BlockData;
    otherPart?: BlockData;
    itemStack?: ItemStack;
    //we use this to differentiate between different block interactions and block breaking as these are stored in the same map
    eventType?: string;
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
    recordedPositions: Vector3[];
    recordedVelocities: Vector3[];
}
export interface PlayerRotationData {
    recordedRotations: Vector2[];
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
    ridingTypeId: (string | null)[];
    isCrawling: number[];
}
export interface PlaybackEntityData {
    customEntity: Entity;
}
export interface RecordedEntityComponent {
    typeId: string;
    componentData: Record<string, unknown>;
}
export interface PlayerDamageData {
    playerID: string;
    playerName: string;
    attackerTypeId: string;
    hurtTick: number;
    DamageDealt: number;
    Weapon: string;
    VictimID: string;
    VictimName: string;
    victimTypeId: string;
}
export type PlayerDamageMap = Map<string, PlayerDamageData[]>;
export interface itemUseData {
    trackingTick: number;
    typeId: string;
    startTime: number;
    chargeTime: number;
    endTime: number;
    isCharged?: boolean;
    firedAt?: number;
}
export type PlayerItemUseDataMap = Map<string, itemUseData[]>;
export interface AmbientEntityData {
    typeId: string;
    recordedData: {
        [tick: number]: {
            location: Vector3;
            rotation: Vector2;
            mountType?: string;
            riderType?: string;
            mountIndex?: number;
            riderIndex?: number;
        };
    };
    spawnTick: number;
    despawnTick: number | null;
    lastSeenTick: number;
    replayEntity?: Entity; // created during playback
    hurtTicks?: Map<number, number>;
    id?: string;
    entityComponents?: RecordedEntityComponent[]; // now stores type + values
    wasSpawned: boolean;
    isProjectile: boolean;
    velocity: Vector3;
}
export type AmbientEntityMap = Map<string, AmbientEntityData>; // entityId -> data

export type ReplayAmbientEntityMap = Map<string, AmbientEntityMap>; // playerId -> entityMap

export interface PlayerEquipmentData {
    weapon1: { tick: number; item: string }[]; // Mainhand
    weapon2: { tick: number; item: string }[]; // Offhand
    armor1: { tick: number; item: string }[]; // Head
    armor2: { tick: number; item: string }[]; //Chest
    armor3: { tick: number; item: string }[]; // Legs
    armor4: { tick: number; item: string }[]; // Feet
}

export interface BuildOption {
    name: string;
    display: string;
    isValid: boolean;
}

// Define the structure of parsed replay data
export interface ReplayDataV3 {
    playerName: string;
    recordingEndTick: number;
    [key: string]: any;
}
//--------------------------------------------------------------------------------------------------------------//
export interface PlayerReplayData {
    trackedPlayers: any[]; // or Player[] if you can guarantee it
    allRecordedPlayerIds: string[];
    players: Record<string, any>;
    settings: Record<string, any>;
}

import { Vector2, Vector3 } from "@minecraft/server";
import { PlayerReplaySession } from "./replay-player-session";

export function initializePlayerMaps(session: PlayerReplaySession, playerId: string) {
    session.replayBlockStateMap.set(playerId, { blockStateChanges: {} });
    session.replayBlockInteractionAfterMap.set(playerId, { blockSateAfterInteractions: {} });
    session.replayBlockInteractionBeforeMap.set(playerId, { blockStateBeforeInteractions: {} });
    //session.replayPositionDataMap.set(playerId, { recordedPositions: [], recordedVelocities: [] });
    //session.replayRotationDataMap.set(playerId, { recordedRotations: [] });
    // --- Updated V2 Initialization ---
    session.replayPositionDataMap.set(playerId, {
        positions: new Map<number, Vector3>(),
        velocities: new Map<number, Vector3>(),
        lastPosition: undefined,
        lastVelocity: undefined,
    });

    session.replayRotationDataMap.set(playerId, {
        rotations: new Map<number, Vector2>(),
        lastRotation: undefined,
    });
    session.replayActionDataMap.set(playerId, {
        flags: new Map<number, number>(),
        ridingTypeId: new Map<number, string | null>(),

        // runtime-only state (not exported)
        lastFlags: 0,
        lastRidingTypeId: null,
    });
    session.replayEntityDataMap.set(playerId, { customEntity: undefined });
    session.replayAmbientEntityMap.set(playerId, new Map());
    session.replayEquipmentDataMap.set(playerId, {
        weapon1: [],
        weapon2: [],
        armor1: [],
        armor2: [],
        armor3: [],
        armor4: [],
    });
    session.allRecordedPlayerIds.add(playerId);
    session.trackedPlayerJoinTicks.set(playerId, {
        joinTick: 0,
        name: undefined,
    });
    session.playerDamageEventsMap.set(playerId, undefined);
    session.playerItemUseDataMap.set(playerId, undefined);
}

import { PlayerReplaySession } from "./replay-player-session";

export function initializePlayerMaps(session: PlayerReplaySession, playerId: string) {
    session.replayBlockStateMap.set(playerId, { blockStateChanges: {} });
    session.replayBlockInteractionAfterMap.set(playerId, { blockSateAfterInteractions: {} });
    session.replayBlockInteractionBeforeMap.set(playerId, { blockStateBeforeInteractions: {} });
    session.replayPositionDataMap.set(playerId, { recordedPositions: [] });
    session.replayRotationDataMap.set(playerId, { recordedRotations: [] });
    session.replayActionDataMap.set(playerId, {
        isSneaking: [],
        isSwimming: [],
        isClimbing: [],
        isFalling: [],
        isFlying: [],
        isGliding: [],
        isRiding: [],
        isSprinting: [],
        isSleeping: [],
        ridingTypeId: [],
        isCrawling: [],
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
}

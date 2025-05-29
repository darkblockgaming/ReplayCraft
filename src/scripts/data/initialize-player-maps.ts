import { PlayerReplaySession } from "./replay-player-session";

export function initializePlayerMaps(session: PlayerReplaySession, playerId: string) {
    session.replayBDataMap.set(playerId, { dbgBlockData: {} });
    session.replayBDataBMap.set(playerId, { dbgBlockDataB: {} });
    session.replayBData1Map.set(playerId, { dbgBlockData1: {} });
    session.replayPosDataMap.set(playerId, { dbgRecPos: [] });
    session.replayRotDataMap.set(playerId, { dbgRecRot: [] });
    session.replayMDataMap.set(playerId, {
        isSneaking: [],
        isSwimming: [],
        isClimbing: [],
        isFalling: [],
        isFlying: [],
        isGliding: [],
        isRiding: [],
        isSprinting: [],
        isSleeping: [],
    });
    session.replayODataMap.set(playerId, { customEntity: undefined });
    session.replaySDataMap.set(playerId, {
        weapon1: [],
        weapon2: [],
        armor1: [],
        armor2: [],
        armor3: [],
        armor4: [],
    });
}

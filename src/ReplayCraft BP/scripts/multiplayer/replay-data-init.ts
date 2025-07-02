import { replaySessions } from "../data/replay-player-session";

export function ensureReplayDataForPlayer(playerId: string) {
    for (const session of replaySessions.playerSessions.values()) {
        // Only act on active or paused recording sessions where this player is tracked
        if (!["recPending", "recPaused"].includes(session.replayStateMachine.state)) continue;
        if (!session.trackedPlayers.find((p) => p.id === playerId)) continue;

        if (!session.replayPositionDataMap.has(playerId)) {
            session.replayPositionDataMap.set(playerId, {
                recordedPositions: [],
                recordedVelocities: [],
            });
        }
        if (!session.replayRotationDataMap.has(playerId)) {
            session.replayRotationDataMap.set(playerId, {
                recordedRotations: [],
            });
        }
        if (!session.replayActionDataMap.has(playerId)) {
            session.replayActionDataMap.set(playerId, {
                isSneaking: [],
                isSleeping: [],
                isClimbing: [],
                isFalling: [],
                isFlying: [],
                isGliding: [],
                isSprinting: [],
                isSwimming: [],
                isRiding: [],
                ridingTypeId: [],
                isCrawling: [],
            });
        }
        if (!session.replayEquipmentDataMap.has(playerId)) {
            session.replayEquipmentDataMap.set(playerId, {
                weapon1: [],
                weapon2: [],
                armor1: [],
                armor2: [],
                armor3: [],
                armor4: [],
            });
        }
    }
}

import { Vector2, Vector3 } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session";

export function ensureReplayDataForPlayer(playerId: string) {
    for (const session of replaySessions.playerSessions.values()) {
        // Only act on active or paused recording sessions where this player is tracked
        if (!["recPending", "recPaused"].includes(session.replayStateMachine.state)) continue;
        if (!session.trackedPlayers.find((p) => p.id === playerId)) continue;

        if (!session.replayPositionDataMap.has(playerId)) {
            session.replayPositionDataMap.set(playerId, {
                positions: new Map<number, Vector3>(),
                velocities: new Map<number, Vector3>(),
                lastPosition: undefined,
                lastVelocity: undefined,
            });
        }
        if (!session.replayRotationDataMap.has(playerId)) {
            session.replayRotationDataMap.set(playerId, {
                rotations: new Map<number, Vector2>(),
                lastRotation: undefined,
            });
        }

        if (!session.replayActionDataMap.has(playerId)) {
            session.replayActionDataMap.set(playerId, {
                flags: new Map<number, number>(),
                ridingTypeId: new Map<number, string | null>(),
                lastFlags: 0,
                lastRidingTypeId: null,
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
        if (!session.playerDamageEventsMap.has(playerId)) {
            session.playerDamageEventsMap.set(playerId, undefined);
        }
        if (!session.playerItemUseDataMap.has(playerId)) {
            session.playerItemUseDataMap.set(playerId, undefined);
        }
    }
}

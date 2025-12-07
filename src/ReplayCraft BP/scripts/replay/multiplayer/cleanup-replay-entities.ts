import { PlayerReplaySession } from "../data/replay-player-session.js";

export function cleanupReplayEntities(session: PlayerReplaySession) {
    for (const playerId of session.allRecordedPlayerIds) {
        const entity = session.replayEntityDataMap.get(playerId);
        if (entity?.customEntity) {
            const typeId = entity.customEntity.typeId;
            if (typeId === "dbg:replayentity_steve" || typeId === "dbg:replayentity_alex") {
                // Just remove from the map
                session.replayEntityDataMap.delete(playerId);
            }
        }
    }
}

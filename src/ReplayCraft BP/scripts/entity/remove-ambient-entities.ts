import { Player, system } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session";
import { debugLog } from "../data/util/debug";
/**
 * Removes replay entities that have been tracked around the player during a recording.
 */
const customReplayTypes = new Set(["dbg:replayentity_steve", "dbg:replayentity_alex", "dbg:rccampos"]);

export function removeOwnedAmbientEntities(player: Player) {
    system.runTimeout(() => {
        const dimension = player.dimension;
        const allEntities = dimension.getEntities();

        for (const entity of allEntities) {
            if (entity.hasTag(`replay:${player.id}`) && !customReplayTypes.has(entity.typeId)) {
                entity.kill();
                debugLog(`Removed ambient entity owned by player ${player.name}: ${entity.id}`);
            }
        }
        // Now clear replayEntity references for this player's session(s)
        const session = replaySessions.playerSessions.get(player.id);
        if (session) {
            for (const [_playerId, entityMap] of session.replayAmbientEntityMap) {
                for (const [_entityId, data] of entityMap) {
                    data.replayEntity = undefined;
                }
            }
        }
    }, 5); // 20 ticks = 1 second
}

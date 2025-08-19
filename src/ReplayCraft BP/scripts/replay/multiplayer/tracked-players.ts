import { world } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session";
import { ensureReplayDataForPlayer } from "./replay-data-init";

const MAX_TRACK_RADIUS = 16;

/**
 * Dynamically updates the list of tracked players for each active recording session.
 * Adds nearby players who are not actively recording themselves and removes those
 * who leave the tracking radius.
 */
export function updateTrackedPlayers() {
    for (const session of replaySessions.playerSessions.values()) {
        if (!["recPending", "recPaused"].includes(session.replayStateMachine.state)) continue;

        const mainRecorder = session.trackedPlayers[0];
        if (!mainRecorder || !mainRecorder.isValid) continue;

        // Get players nearby within tracking radius
        const playersNearby = world.getPlayers().filter((p) => {
            if (p.id === mainRecorder.id) return false;
            const dx = p.location.x - mainRecorder.location.x;
            const dy = p.location.y - mainRecorder.location.y;
            const dz = p.location.z - mainRecorder.location.z;
            const distSq = dx * dx + dy * dy + dz * dz;
            return distSq <= MAX_TRACK_RADIUS * MAX_TRACK_RADIUS;
        });

        const newTracked = [mainRecorder];
        const newTrackedIds = new Set<string>([mainRecorder.id]);

        for (const p of playersNearby) {
            const passiveSession = replaySessions.playerSessions.get(p.id);
            if (passiveSession && ["recPending", "recPaused"].includes(passiveSession.replayStateMachine.state)) {
                continue; // Actively recording their own session
            }

            newTracked.push(p);
            newTrackedIds.add(p.id);
        }

        const oldTracked = session.trackedPlayers;
        const oldTrackedIds = new Set(oldTracked.map((p) => p.id));

        const playersRemoved = oldTracked.filter((p) => !newTrackedIds.has(p.id));
        const playersAdded = newTracked.filter((p) => !oldTrackedIds.has(p.id));

        const changed = playersRemoved.length > 0 || playersAdded.length > 0;

        if (changed) {
            session.trackedPlayers = newTracked;

            mainRecorder.sendMessage(`§7[ReplayCraft] Tracking ${newTracked.length} player(s): §f+${playersAdded.length} -${playersRemoved.length}`);

            // Add newly tracked players to replay data
            for (const p of playersAdded) {
                ensureReplayDataForPlayer(p.id);
                session.allRecordedPlayerIds.add(p.id);
                if (!session.trackedPlayerJoinTicks.has(p.id)) {
                    session.trackedPlayerJoinTicks.set(p.id, session.recordingEndTick ?? 0);
                }
            }

            // Optionally handle removed players (e.g., clean up visuals, stop anims)
            for (const p of playersRemoved) {
                console.log(`§7[ReplayCraft] Player ${p.name} (${p.id}) is no longer being tracked.`);
            }
        }
    }
}

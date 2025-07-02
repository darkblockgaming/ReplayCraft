import { world } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session";
import { ensureReplayDataForPlayer } from "./replay-data-init";

const MAX_TRACK_RADIUS = 16;

/**
 * Dynamically updates the list of tracked players for each active recording session.
 * It includes nearby players who are not actively recording their own sessions.
 */
export function updateTrackedPlayers() {
    for (const session of replaySessions.playerSessions.values()) {
        // Only update tracked players during active or paused recording
        if (!["recPending", "recPaused"].includes(session.replayStateMachine.state)) continue;

        const mainRecorder = session.trackedPlayers[0];
        if (!mainRecorder || !mainRecorder.isValid) continue;

        // Find players within radius of main recorder (excluding themselves)
        const playersNearby = world.getPlayers().filter((p) => {
            if (p.id === mainRecorder.id) return false;
            const dx = p.location.x - mainRecorder.location.x;
            const dy = p.location.y - mainRecorder.location.y;
            const dz = p.location.z - mainRecorder.location.z;
            const distSq = dx * dx + dy * dy + dz * dz;
            return distSq <= MAX_TRACK_RADIUS * MAX_TRACK_RADIUS;
        });

        // Start new tracked list with the main recorder
        const newTracked = [mainRecorder];

        for (const p of playersNearby) {
            // Skip if this player is actively recording their own session
            const passiveSession = replaySessions.playerSessions.get(p.id);
            if (passiveSession && ["recPending", "recPaused"].includes(passiveSession.replayStateMachine.state)) {
                continue; // They're actively recording themselves
            }

            // Add player to main recorder's tracking session (passive tracking only)
            newTracked.push(p);
        }

        // Determine if trackedPlayers has changed (removal or addition)
        const oldIds = new Set(session.trackedPlayers.map((p) => p.id));
        const newIds = new Set(newTracked.map((p) => p.id));
        const changed = oldIds.size !== newIds.size || [...newIds].some((id) => !oldIds.has(id));

        // Always make sure main recorder is in allRecordedPlayerIds
        if (!session.allRecordedPlayerIds.has(mainRecorder.id)) {
            session.allRecordedPlayerIds.add(mainRecorder.id);
            session.trackedPlayerJoinTicks.set(mainRecorder.id, session.recordingEndTick ?? 0);
        }

        // Update trackedPlayers if any changes are detected
        if (changed) {
            session.trackedPlayers = newTracked;
            if (!session.trackedPlayerJoinTicks) {
                session.trackedPlayerJoinTicks = new Map(); // ensure it exists
            }

            mainRecorder.sendMessage(`§7[ReplayCraft] Tracking ${newTracked.length} player(s).`);

            // Initialize replay data and add to allRecordedPlayerIds (append-only)
            newTracked.forEach((player) => {
                ensureReplayDataForPlayer(player.id);
                session.allRecordedPlayerIds.add(player.id);
                // Ensure player is in trackedPlayerJoinTicks and the tick from recordingEndTick
                if (!session.trackedPlayerJoinTicks.has(player.id)) {
                    session.trackedPlayerJoinTicks.set(player.id, session.recordingEndTick ?? 0);
                }
            });
        }
    }
}

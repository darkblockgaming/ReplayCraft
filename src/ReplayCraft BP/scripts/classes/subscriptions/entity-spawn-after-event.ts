import { world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { debugLog } from "../../data/util/debug";

export function registerEntitySpawnHandler({ trackedPlayers }: { trackedPlayers: any[] }) {
    world.afterEvents.entitySpawn.subscribe((event) => {
        const entity = event.entity;
        if (!entity) return;

        trackedPlayers.forEach((player: { id: string }) => {
            const session = replaySessions.playerSessions.get(player.id);
            if (!session) {
                debugLog(`No active replay session for player ${player.id} — skipping entity spawn update.`);
                return;
            }

            const playerMap = session.replayAmbientEntityMap.get(player.id);
            if (!playerMap) {
                debugLog(`No entity map for player ${player.id} — skipping entity spawn update.`);
                return;
            }

            const key = `entity:${entity.id}`;
            const entry = playerMap.get(key);

            if (!entry) {
                debugLog(`Entity ${key} not found in replay map for player ${player.id} — ignoring spawn.`);
                return;
            }

            entry.wasSpawned = true;

            debugLog(`Entity spawn event updated entity ${key} spawnTick to ${entry.spawnTick} and marked as spawned`);
        });
    });
}

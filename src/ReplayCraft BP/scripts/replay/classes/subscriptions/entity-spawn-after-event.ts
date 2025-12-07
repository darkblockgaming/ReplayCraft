import { world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { debugLog } from "../../data/util/debug";
import config from "../../data/util/config";

export function registerEntitySpawnHandler({ trackedPlayers }: { trackedPlayers: any[] }) {
    world.afterEvents.entitySpawn.subscribe((event) => {
        const entity = event.entity;
        if (!entity) return;

        trackedPlayers.forEach((player: { id: string }) => {
            const session = replaySessions.playerSessions.get(player.id);
            if (!session) {
                if (config.debugEntitySpawnEvents === true) {
                    debugLog(`No active replay session for player ${player.id} — skipping entity spawn update.`);
                }

                return;
            }

            const playerMap = session.replayAmbientEntityMap.get(player.id);
            if (!playerMap) {
                if (config.debugEntitySpawnEvents === true) {
                    debugLog(`No entity map for player ${player.id} — skipping entity spawn update.`);
                }

                return;
            }

            const key = `entity:${entity.id}`;
            const entry = playerMap.get(key);

            if (!entry) {
                return;
            }

            entry.wasSpawned = true;
            if (config.debugEntitySpawnEvents === true) {
                debugLog(`Entity spawn event updated entity ${key} spawnTick to ${entry.spawnTick} and marked as spawned`);
            }
        });
    });
}

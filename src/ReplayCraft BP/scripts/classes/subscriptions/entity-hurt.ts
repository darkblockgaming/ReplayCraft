import { world, EntityHurtAfterEvent } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { debugLog } from "../../data/util/debug";

/**
 * Export the function to be called in main.ts
 */
export function onEntityHurt() {
    initializeEventHandlers();
}

/**
 * Function to initialize event handlers for entity hurt events.
 * Subscribes to the entity hurt event to handle additional logic.
 */
function initializeEventHandlers() {
    world.afterEvents.entityHurt.subscribe(onEntityHit);
}

/**
 * Handles entity hurt events
 * This function is triggered when a player hurts and entity
 * @param {EntityHurtAfterEvent} event - The event object containing information about event.
 */
function onEntityHit(event: EntityHurtAfterEvent) {
    const { hurtEntity, damageSource, damage } = event;
    debugLog(`onEntityHit: Entity=${hurtEntity.id}, DamageSource=${damageSource?.damagingEntity?.id ?? "none"}, Damage=${damage}`);

    if (!damageSource || !damageSource.damagingEntity) return;

    if (damageSource.damagingEntity.typeId !== "minecraft:player") {
        // Need to record this data so we can play it back later on
        return;
    }

    const player = damageSource.damagingEntity;
    const playerId = player.id;

    // Try to get the player's own session first
    let session = replaySessions.playerSessions.get(playerId);

    // If no session, try to find a session tracking this player (guest)
    if (!session) {
        session = [...replaySessions.playerSessions.values()].find((s) => s.replayStateMachine.state === "recPending" && s.trackedPlayers.some((p) => p.id === playerId));
    }

    if (!session) return; // no valid session found

    if (session.replayStateMachine.state === "recPending") {
        const ambientMap = session.replayAmbientEntityMap.get(playerId);
        if (!ambientMap) return;

        const entityKey = `entity:${hurtEntity.id}`;
        const data = ambientMap.get(entityKey);
        if (!data) {
            debugLog(`[ReplayCraft DEBUG] No ambient entity match found for hurt entity: ${entityKey}`);
            return;
        }

        const tick = session.recordingEndTick;
        if (!data.hurtTicks) {
            data.hurtTicks = new Map<number, number>();
        }
        data.hurtTicks.set(tick, damage);
    }
}

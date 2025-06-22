import { world, EntityHurtAfterEvent } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";

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
    console.log(`onEntityHit: Entity=${hurtEntity.id}, DamageSource=${damageSource?.damagingEntity?.id ?? "none"}, Damage=${damage}`);

    // Only record ambient entities hurt by players
    if (!damageSource || !damageSource.damagingEntity) return;
    if (damageSource.damagingEntity.typeId !== "minecraft:player") return;

    const player = damageSource.damagingEntity;
    const playerId = player.id;

    const session = replaySessions.playerSessions.get(playerId);
    if (!session) return;

    const ambientMap = session.replayAmbientEntityMap.get(playerId);
    if (!ambientMap) return;

    const entityKey = `entity:${hurtEntity.id}`;
    const data = ambientMap.get(entityKey);
    if (!data) {
        console.log(`[ReplayCraft DEBUG] No ambient entity match found for hurt entity: ${entityKey}`);
        return;
    }

    const tick = session.recordingEndTick;
    if (!data.hurtTicks) {
        data.hurtTicks = new Map<number, number>();
    }
    data.hurtTicks.set(tick, damage);
}

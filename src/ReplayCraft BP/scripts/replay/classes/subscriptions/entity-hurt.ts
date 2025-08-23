import { world, EntityHurtAfterEvent, EquipmentSlot } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { debugLog } from "../../data/util/debug";
import { PlayerDamageData, PlayerDamageMap } from "../types/types";
import config from "../../data/util/config";
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
 * Safely adds a PlayerDamageData entry to a PlayerDamageMap.
 */
function addDamageEvent(map: PlayerDamageMap, playerID: string, event: PlayerDamageData) {
    let events = map.get(playerID);
    if (!events) {
        events = [];
        map.set(playerID, events);
    }
    events.push(event);
}

/**
 * Handles entity hurt events
 * This function is triggered when a player hurts and entity
 * @param {EntityHurtAfterEvent} event - The event object containing information about event.
 */
function onEntityHit(event: EntityHurtAfterEvent) {
    const { hurtEntity, damageSource, damage } = event;
    if (config.debugEntityHurt === true) {
        debugLog(`onEntityHit: Entity=${hurtEntity.id}, DamageSource=${damageSource?.damagingEntity?.id ?? "none"}, Damage=${damage}`);
    }

    if (!damageSource || !damageSource.damagingEntity) return;

    if (damageSource.damagingEntity.typeId !== "minecraft:player") {
        const attacker = damageSource.damagingEntity;
        const victim = hurtEntity;
        let victimSession = replaySessions.playerSessions.get(victim.id);
        const tick = victimSession.recordingEndTick;
        const damageData: PlayerDamageData = {
            playerID: attacker.id,
            playerName: attacker.nameTag ?? "Unknown",
            attackerTypeId: attacker.typeId,
            hurtTick: tick,
            DamageDealt: damage,
            Weapon: attacker.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand)?.typeId ?? "unknown",
            VictimID: victim.id,
            VictimName: victim.nameTag ?? "Unknown",
            victimTypeId: victim.typeId,
        };
        addDamageEvent(victimSession.playerDamageEventsMap, attacker.id, damageData);

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
        const tick = session.recordingEndTick;

        // --- Ambient entity hurt tracking ---
        const ambientMap = session.replayAmbientEntityMap.get(playerId);
        if (ambientMap) {
            const entityKey = `entity:${hurtEntity.id}`;
            const data = ambientMap.get(entityKey);
            if (data) {
                if (!data.hurtTicks) {
                    data.hurtTicks = new Map<number, number>();
                }
                data.hurtTicks.set(tick, damage);
            } else {
                if (config.debugEntityHurt === true) {
                    debugLog(`[ReplayCraft DEBUG] No ambient entity match found for hurt entity: ${entityKey}`);
                }
            }
        }

        // --- Player damage tracking ---
        if (damageSource.damagingEntity.typeId === "minecraft:player" && hurtEntity.typeId === "minecraft:player") {
            const attacker = damageSource.damagingEntity;
            const victim = hurtEntity;

            const damageData: PlayerDamageData = {
                playerID: attacker.id,
                playerName: attacker.nameTag ?? "Unknown",
                attackerTypeId: attacker.typeId,
                hurtTick: tick,
                DamageDealt: damage,
                Weapon: attacker.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand)?.typeId ?? "unknown",
                VictimID: victim.id,
                VictimName: victim.nameTag ?? "Unknown",
                victimTypeId: victim.typeId,
            };

            // Store in attacker's session
            addDamageEvent(session.playerDamageEventsMap, attacker.id, damageData);
            if (config.debugPlayerHurt === true) {
                debugLog(`[ReplayCraft DEBUG] Recorded player damage for attacker: ${JSON.stringify(damageData)}`);
            }

            // Victim session logging
            let victimSession = replaySessions.playerSessions.get(victim.id);
            if (!victimSession) {
                victimSession = [...replaySessions.playerSessions.values()].find((s) => s.replayStateMachine.state === "recPending" && s.trackedPlayers.some((p) => p.id === victim.id));
            }

            if (victimSession?.replayStateMachine.state === "recPending") {
                addDamageEvent(victimSession.playerDamageEventsMap, victim.id, {
                    ...damageData,
                    playerID: victim.id,
                    playerName: victim.nameTag ?? "Unknown",
                    VictimID: victim.id,
                    VictimName: victim.nameTag ?? "Unknown",
                    victimTypeId: victim.typeId,
                });
                if (config.debugPlayerHurt === true) {
                    debugLog(`[ReplayCraft DEBUG] Recorded player damage for victim: ${JSON.stringify(damageData)}`);
                }
            }
        }
    }
}

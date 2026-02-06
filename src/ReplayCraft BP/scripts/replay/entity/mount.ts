import { Dimension, Entity } from "@minecraft/server";
import config from "../data/util/config";
import { debugError, debugLog } from "../data/util/debug";
import { AmbientEntityData } from "../classes/types/types";

/**
 * Attempts to resolve and apply a mount relationship for a replay entity.
 *
 * This is primarily used during replay playback to re-attach a rider entity
 * to a previously recorded mount, using a deterministic index lookup.
 *
 * The function will safely exit if:
 * - The rider entity is missing or invalid
 * - The rider is already mounted
 * - The mount index is out of bounds
 * - The resolved mount is invalid or not rideable
 *
 * @param dimension - The dimension in which the mount lookup should occur
 * @param riderData - Ambient replay entity data containing the rider entity reference
 * @param mountType - The entity type ID of the mount (e.g. `minecraft:horse`)
 * @param mountIndex - Index into the filtered mount list used to deterministically select a mount
 */
export function tryResolveMount(dimension: Dimension, riderData: AmbientEntityData, mountType: string, mountIndex: number) {
    const rider = riderData.replayEntity;
    if (!rider || !rider.isValid) return;

    // Already riding something → do nothing
    const ridingComp = rider.getComponent("minecraft:riding");
    if (ridingComp?.entityRidingOn) return;

    // Find mounts of the correct type
    const mounts = dimension.getEntities({ type: mountType }).filter((e) => e.isValid);

    if (mountIndex >= mounts.length) return;

    const mount = mounts[mountIndex];
    if (!mount || !mount.isValid) return;

    const rideable = mount.getComponent("minecraft:rideable");
    if (!rideable) return;

    try {
        const success = rideable.addRider(rider);

        if (success && config.debugMounting) {
            debugLog(`[ReplayCraft DEBUG] Mounted ${rider.typeId} → ${mount.typeId} (mountIndex=${mountIndex})`);
        }
    } catch (e) {
        debugError(`Failed to mount ${rider.typeId} onto ${mount.typeId}: ${e}`);
    }
}

/**
 * Attempts to resolve and apply a mount relationship for a replay-player entity.
 *
 * If the player is already riding an entity, the current mount is returned.
 * Otherwise, this function searches for a nearby replay-recorded mount matching
 * the given type and recorder tag, and attempts to mount the player onto it.
 *
 * The function will safely return `undefined` if:
 * - No suitable mount is found nearby
 * - The resolved entity is not rideable
 * - Mounting fails or throws
 *
 * @param dimension - The dimension in which the mount search should occur
 * @param playerEntity - The replay-player entity attempting to mount
 * @param mountType - The entity type ID of the expected mount (e.g. `minecraft:boat`)
 * @param recorderId - Replay recorder identifier used to tag mount entities
 *
 * @returns The mount entity the player is riding, or `undefined` if no mount
 *          could be resolved or applied
 */

export function tryResolvePlayerMount(dimension: Dimension, playerEntity: Entity, mountType: string, recorderId: string): Entity | undefined {
    const ridingComp = playerEntity.getComponent("minecraft:riding");

    // Already riding → just return the mount
    if (ridingComp?.entityRidingOn) {
        return ridingComp.entityRidingOn;
    }

    const candidates = dimension.getEntities({
        type: mountType,
        tags: [`replay:${recorderId}`],
        maxDistance: 3,
        location: playerEntity.location,
    });

    const mount = candidates.find((e) => e.getComponent("minecraft:rideable"));
    if (!mount) return undefined;

    const rideable = mount.getComponent("minecraft:rideable");
    if (!rideable) return undefined;

    try {
        const success = rideable.addRider(playerEntity);
        if (!success) return undefined;

        if (config.debugMounting) {
            debugLog(`[ReplayCraft DEBUG] Mounted player onto ${mount.typeId} (${mount.id})`);
        }

        return mount;
    } catch (e) {
        debugError(`Failed to mount player onto ${mount.typeId}: ${e}`);
        return undefined;
    }
}

/**
 * Resolves the seat index a rider entity occupies on a rideable mount.
 *
 * The function will return `undefined` if:
 * - The mount does not have a rideable component
 * - The rider is not currently mounted on the entity
 * - The rider list cannot be accessed or throws
 *
 * @param mount - The rideable entity the rider is mounted on
 * @param rider - The rider entity whose seat index should be resolved
 *
 * @returns The zero-based seat index of the rider, or `undefined` if it
 *          cannot be determined
 */
export function getSeatIndex(mount: Entity, rider: Entity): number | undefined {
    let result: number | undefined = undefined;

    const rideable = mount.getComponent("minecraft:rideable");
    if (!rideable) return result;

    try {
        const riders = rideable.getRiders();
        const index = riders.findIndex((e) => e.id === rider.id);
        if (index >= 0) result = index;
    } catch {}

    return result;
}

export function forceSeatIndexZero(mount: Entity, primaryRider: Entity) {
    const rideable = mount.getComponent("minecraft:rideable");
    if (!rideable) return;

    const seatFixTag = `seat0_fixed:${primaryRider.id}`;
    if (mount.hasTag(seatFixTag)) return;

    try {
        const riders = rideable.getRiders();

        // Already seat 0
        if (riders[0]?.id === primaryRider.id) {
            mount.addTag(seatFixTag);
            return;
        }

        // Eject all riders
        for (const rider of riders) {
            rideable.ejectRider(rider);
        }

        // Add PRIMARY rider FIRST → seat index 0
        rideable.addRider(primaryRider);

        // Add remaining riders in original order
        for (const rider of riders) {
            if (rider.id !== primaryRider.id && rider.isValid) {
                rideable.addRider(rider);
            }
        }

        mount.addTag(seatFixTag);
    } catch {
        // Bedrock can throw mid-tick; ignore safely
    }
}

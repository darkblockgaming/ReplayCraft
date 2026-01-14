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
 * Attempts to mount a the replay-player entity onto a nearby replay-recorded mount.
 *
 * This is typically used when restoring player mounts during replay syncing,
 * matching mounts via a shared replay recorder tag.
 *
 * The function will safely exit if:
 * - The player is already riding an entity
 * - No nearby mount matches the recorder tag
 * - The resolved entity is not rideable
 *
 * @param dimension - The dimension in which the mount search should occur
 * @param playerEntity - The player entity attempting to mount
 * @param mountType - The entity type ID of the expected mount
 * @param recorderId - Replay recorder identifier used to tag mount entities
 */
export function tryResolvePlayerMount(dimension: Dimension, playerEntity: Entity, mountType: string, recorderId: string) {
    const ridingComp = playerEntity.getComponent("minecraft:riding");
    if (ridingComp?.entityRidingOn) return; // already riding

    const candidates = dimension.getEntities({
        type: mountType,
        tags: [`replay:${recorderId}`],
        maxDistance: 3,
        location: playerEntity.location,
    });

    const mount = candidates.find((e) => e.getComponent("minecraft:rideable"));
    if (!mount) return;

    const rideable = mount.getComponent("minecraft:rideable");
    if (!rideable) return;

    try {
        rideable.addRider(playerEntity);

        if (config.debugMounting) {
            debugLog(`[ReplayCraft DEBUG] Mounted player onto ${mount.typeId} (${mount.id})`);
        }
    } catch (e) {
        debugError(`Failed to mount player onto ${mount.typeId}: ${e}`);
    }
}

import { CustomCommandOrigin, CustomCommandStatus, Entity, Player, system, VanillaEntityIdentifier } from "@minecraft/server";
import { safeSet } from "../../main";

export function debugPlayAnimationCmd(_origin: CustomCommandOrigin, PropertyID: string, Value: string) {
    function findPlaybackEntityNear(sender: Entity): Entity | undefined {
        // Get all entities within a radius (e.g., 10 blocks)
        const nearbyEntities = sender.dimension.getEntities({
            location: sender.location,
            maxDistance: 10,
            tags: [], // Optionally filter by tags
        });

        // Find the first entity matching our playback entity identifier
        for (const entity of nearbyEntities) {
            if (entity.typeId === "dbg:replayentity_steve" && entity.isValid) {
                return entity;
            }
        }
        return undefined;
    }
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    let playbackEntity = findPlaybackEntityNear(sender);
    system.run(() => {
        const prop = PropertyID;
        const rawValue = Value;

        if (!prop || rawValue === undefined) {
            sender.sendMessage("Usage: ?playan,<prop>,<value>");
            return;
        }

        const fullProp = prop.startsWith("rc:") ? prop : `rc:${prop}`;
        const isBoolProp = fullProp.startsWith("rc:is_");

        const value = isBoolProp ? rawValue === "1" || rawValue.toLowerCase() === "true" : isNaN(Number(rawValue)) ? rawValue : Number(rawValue);

        if (!playbackEntity || !playbackEntity.isValid) {
            playbackEntity = sender.dimension.spawnEntity("dbg:replayentity_steve" as VanillaEntityIdentifier, sender.location);
            if (!playbackEntity) {
                sender.sendMessage("Failed to spawn playback entity.");
                return;
            }
            sender.sendMessage("Spawned new playback entity.");
        }

        safeSet(playbackEntity, fullProp, value);
        sender.sendMessage(`Set ${fullProp} to ${value}`);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Opening Database UI.`,
    };
}

/**
 * Converts a vanilla entity type ID to its replay copy identifier.
 * Example: "minecraft:thrown_trident" -> "rc:thrown_trident"
 */
export function getReplayEntityId(typeId: string): string {
    switch (typeId) {
        case "minecraft:thrown_trident":
            return "rc:thrown_trident";
        case "minecraft:ender_pearl":
            return "rc:ender_pearl";
        default:
            return typeId;
    }
}

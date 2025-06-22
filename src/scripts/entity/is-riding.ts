import { Player } from "@minecraft/server";

/**
 * Returns true if the player is currently riding another entity.
 */
export function isPlayerRiding(player: Player): boolean {
    const ridingComponent = player.getComponent("minecraft:riding");
    return ridingComponent !== undefined;
}

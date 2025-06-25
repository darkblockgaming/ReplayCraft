import { Player } from "@minecraft/server";

export function isPlayerCrawling(player: Player): boolean {
    try {
        const eyeY = player.getHeadLocation().y;
        const feetY = player.location.y;
        const headRoom = eyeY - feetY;

        // Crawling: player head is in a <1.5 block space and not doing other conflicting actions
        const inTightSpace = headRoom < 1.5;

        const isNotFlying = !player.isFlying;
        const isNotGliding = !player.isGliding;
        const isNotSwimming = !player.isSwimming;
        //Might also need to check to see if the player is not sneaking.

        if (isNotFlying && isNotGliding && isNotSwimming) {
            return inTightSpace;
        }

        return false;
    } catch {
        return false;
    }
}

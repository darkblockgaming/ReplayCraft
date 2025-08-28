/**
 * @file Item Animation Playback
 * @description Handles the playback of item animations such as bow drawing and releasing.
 * Due to limitations of the api we have to use workarounds to simulate these actions.
 * In this case we will give the playback entity a custom bow item over the course of the animation time.
 * This will simulate the bow drawing animation.
 */

import { Entity, ItemStack } from "@minecraft/server";

export function playItemAnimation(entity: Entity, typeId: string, progress: number) {
    switch (typeId) {
        case "minecraft:bow":
            let stagedItem: ItemStack;

            if (progress < 0.33) {
                stagedItem = new ItemStack("rc:bow_0", 1);
            } else if (progress < 0.66) {
                stagedItem = new ItemStack("rc:bow_1", 1);
            } else {
                stagedItem = new ItemStack("rc:bow_2", 1);
            }

            entity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${stagedItem.typeId} 1`);
            break;
    }
}

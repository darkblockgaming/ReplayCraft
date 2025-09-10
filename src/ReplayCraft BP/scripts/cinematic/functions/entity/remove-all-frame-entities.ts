import { Player, world } from "@minecraft/server";
import { frameDataMap } from "../../data/maps";

export function removeAllFrameEntities(player: Player) {
    const frames = frameDataMap.get(player.id);
    if (!frames || frames.length === 0) return;

    for (const frame of frames) {
        world.getEntity(frame.entityId)?.remove();
    }
}

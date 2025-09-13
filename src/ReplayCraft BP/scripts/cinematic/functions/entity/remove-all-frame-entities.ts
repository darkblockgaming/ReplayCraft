import { Player, world } from "@minecraft/server";
import { cineRuntimeDataMap, frameDataMap } from "../../data/maps";

export function removeAllFrameEntities(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic);
    if (!frames || frames.length === 0) return;

    for (const frame of frames) {
        world.getEntity(frame.entityId)?.remove();
    }
}

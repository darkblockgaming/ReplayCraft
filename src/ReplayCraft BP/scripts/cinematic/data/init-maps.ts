import { Player } from "@minecraft/server";
import { cineRuntimeDataMap } from "./maps";

export function initMaps(player: Player) {
    if (!cineRuntimeDataMap.has(player.id)) {
        cineRuntimeDataMap.set(player.id, {
            state: "framePlacementMenu",
            isCameraInMotion: false
        });
    }
}

import { Player } from "@minecraft/server";

import { cinematicFramesDB } from "./../cinematic";
import { clearOtherFrameEntities } from "./entity/clear-other-frame-entities";
import { cineRuntimeDataMap, frameDataMap } from "../data/maps";
import { refreshAllFrameEntities } from "./entity/refresh-all-frame-entities";

export function loadInstance(player: Player, cinematicName: string, cinematicType: number) {
    clearOtherFrameEntities(player);

    //Update runtime data
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    cineRuntimeData.loadedCinematic = cinematicName;
    cineRuntimeData.loadedCinematicType = cinematicType;
    cineRuntimeDataMap.set(player.id, cineRuntimeData);

    const isFocusPoint = Boolean(cinematicType);

    //Load of init the frame data for selected or created path
    frameDataMap.set(cinematicName, cinematicFramesDB.get(cinematicName) ?? []);
    refreshAllFrameEntities(player, isFocusPoint);

    //console.warn(`loaded instance`);
}

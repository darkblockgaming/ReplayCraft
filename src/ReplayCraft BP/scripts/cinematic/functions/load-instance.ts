import { Player } from "@minecraft/server";

import { cinematicFramesDB } from "./../cinematic";
import { clearOtherFrameEntities } from "./entity/clear-other-frame-entities";
import { cineRuntimeDataMap, frameDataMap } from "../data/maps";
import { refreshAllFrameEntities } from "./entity/refresh-all-frame-entities";
import { CinematicBasicData } from "../data/types/types";

export function loadInstance(player: Player, cinematicBasicData: CinematicBasicData) {
    clearOtherFrameEntities(player);

    //Update runtime data
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    cineRuntimeData.loadedCinematic = cinematicBasicData.name;
    cineRuntimeData.loadedCinematicType = cinematicBasicData.type;
    cineRuntimeDataMap.set(player.id, cineRuntimeData);


    //Load of init the frame data for selected or created path
    frameDataMap.set(cinematicBasicData.name, cinematicFramesDB.get(cinematicBasicData.name) ?? []);
    refreshAllFrameEntities(player, cinematicBasicData.type);

    //console.warn(`loaded instance`);
}

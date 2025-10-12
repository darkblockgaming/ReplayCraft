import { Player } from "@minecraft/server";

import { cinematicFramesDB, cinematicSettingsDB } from "./../cinematic";
import { clearOtherFrameEntities } from "./entity/clear-other-frame-entities";
import { cineRuntimeDataMap, frameDataMap, settingsDataMap } from "../data/maps";
import { refreshAllFrameEntities } from "./entity/refresh-all-frame-entities";
import { CinematicBasicData } from "../data/types/types";

export function loadInstance(player: Player, cinematicBasicData: CinematicBasicData) {
    clearOtherFrameEntities(player);

    //Update runtime data
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    cineRuntimeData.loadedCinematic = cinematicBasicData.name;
    cineRuntimeData.loadedCinematicType = cinematicBasicData.type;
    cineRuntimeDataMap.set(player.id, cineRuntimeData);

    //load or set default settings data/configurations
    settingsDataMap.set(
        cinematicBasicData.name,
        cinematicSettingsDB.get(cinematicBasicData.name) ?? {
            hideHud: true,
            easeType: 0,
            camSpeed: 0.8,
            camFacingType: 0,
            camFacingX: 0,
            camFacingY: 0,
            cinePrevSpeed: 0.5,
            cinePrevSpeedMult: 5,
            panoRPM: 8,
            panoRotDir: "clockwise",
            orbitalSpeed: 0.8,
            orbitalRadius: 5,
            orbitalHeightOffset: 0,
            orbitalRotDir: "clockwise",
        }
    );

    //Load or init the frame data for selected or created path
    frameDataMap.set(cinematicBasicData.name, cinematicFramesDB.get(cinematicBasicData.name) ?? []);
    refreshAllFrameEntities(player, cinematicBasicData.type);

    //console.warn(`loaded instance`);
}

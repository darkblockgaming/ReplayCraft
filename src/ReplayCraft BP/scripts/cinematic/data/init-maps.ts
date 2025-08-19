import { Player } from "@minecraft/server";
import { frameDataMap, settingsDataMap, otherDataMap } from "./maps";

export function initMaps(player: Player) {
    if (!frameDataMap.has(player.id)) {
        frameDataMap.set(player.id, []);
    }
    if (!settingsDataMap.has(player.id)) {
        settingsDataMap.set(player.id, {
            hideHud: true,
            easeType: 0,
            easetime: 4,
            camFacingType: 0,
            camFacingX: 0,
            camFacingY: 0,
            cineParType: 0,
            cinePrevSpeed: 0.5,
            cineParSwitch: true,
            cinePrevSpeedMult: 5,
            cineFadeSwitch: true,
            cineRedValue: 37,
            cineGreenValue: 128,
            cineBlueValue: 27,
        });
    }
    if (!otherDataMap.has(player.id)) {
        otherDataMap.set(player.id, {
            isCameraInMotion: false,
            retrievedData: false,
            retrievedSett: false,
        });
    }
}

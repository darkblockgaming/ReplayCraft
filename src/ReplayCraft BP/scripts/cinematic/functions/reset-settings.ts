import { Player } from "@minecraft/server";
import { settingsDataMap, otherDataMap } from "../data/maps";

export function cineResetSettings(player: Player) {
    const otherData = otherDataMap.get(player.id);

    if (otherData.isCameraInMotion === true) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "dbg.rc2.mes.cannot.reset.settings.while.camera.is.in.motion",
        });
        return;
    }
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
    player.sendMessage({
        translate: "dbg.rc2.mes.all.settings.have.been.reset.to.default",
    });
}

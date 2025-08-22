import { Player } from "@minecraft/server";
import { settingsDataMap, otherDataMap } from "../../../data/maps";

export function cineResetSettings(player: Player) {
    const otherData = otherDataMap.get(player.id);

    if (otherData.isCameraInMotion === true) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "dbg.rc2.mes.cannot.reset.settings.while.camera.is.in.motion",
        });
        return;
    }
    const current = settingsDataMap.get(player.id);
    settingsDataMap.set(player.id, {
        ...current,
        hideHud: true,
        easeType: 0,
        camFacingType: 0,
        camFacingX: 0,
        camFacingY: 0,
        cineFadeSwitch: true,
        cineRedValue: 37,
        cineGreenValue: 128,
        cineBlueValue: 27,
        easetime: 4
    });
    player.sendMessage({
        translate: "dbg.rc2.mes.all.settings.have.been.reset.to.default",
    });
}

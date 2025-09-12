import { Player } from "@minecraft/server";
import { settingsDataMap, cineRuntimeDataMap } from "../../../data/maps";
import { cinematicSettingsDB } from "../../../cinematic";

export function cineResetSettings(player: Player) {
    const otherData = cineRuntimeDataMap.get(player.id);

    if (otherData.isCameraInMotion === true) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "dbg.rc2.mes.cannot.reset.settings.while.camera.is.in.motion",
        });
        return;
    }
    const current = settingsDataMap.get(player.id);
    const defaults = {
        ...current,
        hideHud: true,
        easeType: 0,
        camFacingType: 0,
        camFacingX: 0,
        camFacingY: 0,
        camSpeed: 0.8,
    };
    settingsDataMap.set(player.id, defaults);
    cinematicSettingsDB.set(player.id, defaults);

    player.sendMessage({
        translate: "dbg.rc2.mes.all.settings.have.been.reset.to.default",
    });
}

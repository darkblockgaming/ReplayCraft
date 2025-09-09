import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { settingsDataMap, cineRuntimeDataMap } from "../../../data/maps";

// Small helper to avoid repeating message + sound
function notifyPlayer(player: Player, translationKey: string, sound: string = "note.bass") {
    player.sendMessage({ translate: translationKey });
    player.playSound(sound);
}

export function frameSettings(player: Player) {
    const otherData = cineRuntimeDataMap.get(player.id);
    if (otherData?.isCameraInMotion) {
        notifyPlayer(player, "dbg.rc2.mes.cannot.change.settings.while.camera.is.in.motion");
        return;
    }

    const settingsData = settingsDataMap.get(player.id);

    // Keep track of indices so we don’t rely on magic numbers
    const FIELD_INDEX = {
        previewSpeedMult: 4,
    } as const;

    const form = new ModalFormData()
        .title("dbg.rc2.title.frame.settings")
        .divider()
        .label("dbg.rc2.lebel.particle.settings")
        .divider()
        .label("dbg.rc2.lebel.preview.settings")
        .slider({ translate: "dbg.rc2.slider.preview.speed.multiplier" }, 1, 10, {
            valueStep: 1,
            defaultValue: settingsData.cinePrevSpeedMult,
        })
        .divider();

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "dbg.rc2.mes.please.click.submit");
            return;
        }

        const values = response.formValues;
        settingsData.cinePrevSpeedMult = Number(values[FIELD_INDEX.previewSpeedMult]);
        settingsData.cinePrevSpeed = Math.round((1 / settingsData.cinePrevSpeedMult) * 10) / 10;

        notifyPlayer(player, "dbg.rc2.mes.settings.have.been.saved.successfully", "random.orb");
    });
}


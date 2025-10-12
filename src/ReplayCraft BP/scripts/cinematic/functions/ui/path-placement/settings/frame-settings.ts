import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { settingsDataMap, cineRuntimeDataMap } from "../../../../data/maps";
import { notifyPlayer } from "../../../helpers/notify-player";
import { cinematicSettingsDB } from "../../../../cinematic";

export function frameSettings(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    if (cineRuntimeData?.isCameraInMotion) {
        notifyPlayer(player, "rc2.mes.cannot.change.settings.while.camera.is.in.motion");
        return;
    }

    const settingsData = settingsDataMap.get(cineRuntimeData.loadedCinematic);

    // Keep track of indices so we don’t rely on magic numbers
    const FIELD_INDEX = {
        previewSpeedMult: 2,
    } as const;

    const form = new ModalFormData()
        .title("rc2.title.frame.settings")
        .divider()
        .label("rc2.lebel.preview.settings")
        .slider({ translate: "rc2.slider.preview.speed.multiplier" }, 1, 10, {
            valueStep: 1,
            defaultValue: settingsData.cinePrevSpeedMult,
        })
        .divider();

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "rc2.mes.please.click.submit");
            return;
        }

        const values = response.formValues;
        settingsData.cinePrevSpeedMult = Number(values[FIELD_INDEX.previewSpeedMult]);
        settingsData.cinePrevSpeed = Math.round((1 / settingsData.cinePrevSpeedMult) * 10) / 10;

        settingsDataMap.set(cineRuntimeData.loadedCinematic, settingsData);
        cinematicSettingsDB.set(cineRuntimeData.loadedCinematic, settingsData);

        notifyPlayer(player, "rc2.mes.settings.have.been.saved.successfully", "random.orb");
    });
}

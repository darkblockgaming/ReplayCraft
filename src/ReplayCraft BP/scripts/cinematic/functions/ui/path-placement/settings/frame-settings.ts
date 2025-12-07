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
        cinePrevSpeed: 2,
    } as const;

    const form = new ModalFormData()
        .title("rc2.title.frame.settings")
        .divider()
        .label("rc2.lebel.preview.settings")
        .textField("rc2.slider.camspeed", "Numbers only: 0.1, 0.5, 1, 2, 3, etc...", { defaultValue: String(settingsData.cinePrevSpeed) })
        .divider();

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "rc2.mes.please.click.submit");
            return;
        }

        const values = response.formValues;

        // Manage speed
        const raw = values[FIELD_INDEX.cinePrevSpeed];
        const value = Number(raw);
        if (typeof raw !== "string" || raw.trim() === "" || isNaN(value) || value <= 0) {
            notifyPlayer(player, "rc2.mes.invalid.speed.value", "note.bass");
            settingsData.cinePrevSpeed = settingsData.cinePrevSpeed ?? 45.5;
            return;
        }
        settingsData.cinePrevSpeed = value;

        settingsDataMap.set(cineRuntimeData.loadedCinematic, settingsData);
        cinematicSettingsDB.set(cineRuntimeData.loadedCinematic, settingsData);

        notifyPlayer(player, "rc2.mes.settings.have.been.saved.successfully", "random.orb");
    });
}

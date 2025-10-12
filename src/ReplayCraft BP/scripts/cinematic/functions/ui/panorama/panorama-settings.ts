import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { cineRuntimeDataMap, settingsDataMap } from "../../../data/maps";
import { notifyPlayer } from "../../helpers/notify-player";
import { cinematicSettingsDB } from "../../../cinematic";

export function panoramaSettings(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    if (cineRuntimeData?.isCameraInMotion) {
        notifyPlayer(player, "rc2.mes.cannot.change.settings.while.camera.is.in.motion");
        return;
    }

    const settingsData = settingsDataMap.get(cineRuntimeData.loadedCinematic);

    const FIELD_INDEX = {
        panoRPM: 2,
        panoRotationType: 3,
    } as const;

    const form = new ModalFormData()
        .title("rc2.title.pano.settings")
        .divider()
        .label("rc2.lebel.pano.rotation")
        .slider({ rawtext: [{ translate: "rc2.slider.pano.rmp" }] }, 1, 150, {
            valueStep: 1,
            defaultValue: settingsData.panoRPM,
        })
        .dropdown({ rawtext: [{ translate: "rc2.dropdown.pano.rotation.type" }] }, [{ rawtext: [{ translate: "rc2.dropdown.value.clockwise" }] }, { rawtext: [{ translate: "rc2.dropdown.value.anticlockwise" }] }], {
            defaultValueIndex: settingsData.panoRotDir === "anticlockwise" ? 1 : 0,
        })
        .divider();

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "rc2.mes.please.click.submit");
            return;
        }

        const values = response.formValues;

        settingsData.panoRPM = Number(values[FIELD_INDEX.panoRPM]);
        settingsData.panoRotDir = Number(values[FIELD_INDEX.panoRotationType] === 0) ? "clockwise" : "anticlockwise";

        settingsDataMap.set(cineRuntimeData.loadedCinematic, settingsData);
        cinematicSettingsDB.set(cineRuntimeData.loadedCinematic, settingsData);
    });
}

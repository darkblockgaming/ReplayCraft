import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { cineRuntimeDataMap, settingsDataMap } from "../../../data/maps";
import { notifyPlayer } from "../../helpers/notify-player";
import { cinematicSettingsDB } from "../../../cinematic";

export function orbitalSettings(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    if (cineRuntimeData?.isCameraInMotion) {
        notifyPlayer(player, "rc2.mes.cannot.change.settings.while.camera.is.in.motion");
        return;
    }

    const settingsData = settingsDataMap.get(cineRuntimeData.loadedCinematic);

    const FIELD_INDEX = {
        orbitalSpeed: 2,
        orbitalRadius: 3,
        orbitalHeightOffset: 4,
        orbitalRotDir: 5,
    } as const;

    const form = new ModalFormData()
        .title("rc2.title.orbital.settings")
        .divider()
        .label("rc2.lebel.orbital.speed.n.orientation")
        .textField("rc2.textfield.orbital.orbitalSpeed", "Positive Numbers only: 0.1, 0.5, 1, 2, 3, etc...", { defaultValue: String(settingsData.orbitalSpeed) })
        .textField("rc2.textfield.orbital.radius", "Positive Numbers only: 0.1, 0.5, 1, 2, 3, etc...", { defaultValue: String(settingsData.orbitalRadius) })

        .slider({ rawtext: [{ translate: "rc2.slider.orbital.height.offset" }] }, -20, 20, {
            valueStep: 1,
            defaultValue: settingsData.orbitalHeightOffset,
        })
        .dropdown({ rawtext: [{ translate: "rc2.dropdown.orbital.rotation.type" }] }, [{ rawtext: [{ translate: "rc2.dropdown.value.clockwise" }] }, { rawtext: [{ translate: "rc2.dropdown.value.anticlockwise" }] }], {
            defaultValueIndex: settingsData.orbitalRotDir === "anticlockwise" ? 1 : 0,
        })
        .divider();

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "rc2.mes.please.click.submit");
            return;
        }

        const values = response.formValues;
        // Manage speed
        const raw = values[FIELD_INDEX.orbitalSpeed];
        const value = Number(raw);
        world.sendMessage(`speed ${raw}, then ${value}`);
        if (typeof raw !== "string" || raw.trim() === "" || isNaN(value) || value <= 0) {
            notifyPlayer(player, "rc2.mes.invalid.speed.value", "note.bass");
            settingsData.orbitalSpeed = settingsData.orbitalSpeed ?? 0.8;
            return;
        }
        settingsData.orbitalSpeed = value;

        // Manage orbital radius
        const rawRadius = values[FIELD_INDEX.orbitalRadius];
        const radiusValue = Number(rawRadius);
        if (typeof rawRadius !== "string" || rawRadius.trim() === "" || isNaN(radiusValue) || radiusValue <= 0) {
            notifyPlayer(player, "rc2.mes.invalid.orbital.radius.value", "note.bass");
            settingsData.orbitalRadius = settingsData.orbitalRadius ?? 5;
            return;
        }
        settingsData.orbitalRadius = radiusValue;

        settingsData.orbitalHeightOffset = Number(values[FIELD_INDEX.orbitalHeightOffset]) ?? 0;
        settingsData.orbitalRotDir = values[FIELD_INDEX.orbitalRotDir] === 0 ? "clockwise" : "anticlockwise";

        settingsDataMap.set(cineRuntimeData.loadedCinematic, settingsData);
        cinematicSettingsDB.set(cineRuntimeData.loadedCinematic, settingsData);

        world.sendMessage(`${settingsData.orbitalSpeed}, ${settingsData.orbitalRadius}, ${settingsData.orbitalHeightOffset}, ${settingsData.orbitalRotDir}`);

    });
}


// world.sendMessage(`${FIELD_INDEX.orbitalSpeed}, ${FIELD_INDEX.orbitalRadius}, ${FIELD_INDEX.orbitalHeightOffset}, ${FIELD_INDEX.orbitalRotDir}`);
        // world.sendMessage(`${Number(raw)}, ${Number(rawRadius)}, ${Number(values[FIELD_INDEX.orbitalHeightOffset]) ?? 0}, ${Number(values[FIELD_INDEX.orbitalRotDir] === 0) ? "clockwise" : "anticlockwise"}`);
        // world.sendMessage(`${settingsData.orbitalSpeed}, ${settingsData.orbitalRadius}, ${settingsData.orbitalHeightOffset}, ${settingsData.orbitalRotDir}`);

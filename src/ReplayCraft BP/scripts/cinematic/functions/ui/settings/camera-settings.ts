import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { settingsDataMap, cineRuntimeDataMap } from "../../../data/maps";
import { easeTypes } from "../../../data/constants/constants";
import { notifyPlayer } from "../../helpers/notify-player";
import { cinematicSettingsDB } from "../../../cinematic";

export function cameraSettings(player: Player) {
    const otherData = cineRuntimeDataMap.get(player.id);
    if (otherData?.isCameraInMotion) {
        notifyPlayer(player, "dbg.rc2.mes.cannot.change.settings.while.camera.is.in.motion");
        return;
    }

    const settingsData = settingsDataMap.get(player.id);

    const FIELD_INDEX = {
        camSpeed: 2,
        easeType: 5,
        camFacingType: 8,
        camFacingX: 9,
        camFacingY: 10,
        hideHud: 13,
    } as const;

    const form = new ModalFormData()
        .title("dbg.rc2.title.camera.settings")
        .divider()
        .label("dbg.rc2.lebel.camera.speed.options")
        .textField("dbg.rc2.slider.camspeed", "Numbers only: 0.1, 0.5, 1, 2, 3, etc...", { defaultValue: String(settingsData.camSpeed) })
        .divider()
        .label("dbg.rc2.lebel.easing.settings")
        .dropdown("dbg.rc2.dropdown.ease.type", easeTypes, {
            defaultValueIndex: settingsData.easeType,
        })
        .divider()
        .label("dbg.rc2.lebel.camera.options")
        .dropdown("dbg.rc2.dropdown.camera.facing.type", ["Default", "Custom Rotation `Select Below`", "Focus On Player"], {
            defaultValueIndex: settingsData.camFacingType,
        })
        .slider({ rawtext: [{ translate: "dbg.rc2.slider.pitch" }] }, -90, 90, {
            valueStep: 1,
            defaultValue: settingsData.camFacingX,
        })
        .slider({ rawtext: [{ translate: "dbg.rc2.slider.yaw" }] }, 0, 360, {
            valueStep: 1,
            defaultValue: settingsData.camFacingY,
        })
        .divider()
        .label("dbg.rc2.lebel.screen.settings")
        .toggle("dbg.rc2.toggle.hide.hud", { defaultValue: settingsData.hideHud })
        .divider();

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "dbg.rc2.mes.please.click.submit");
            return;
        }

        const values = response.formValues;

        // Manage speed
        const raw = values[FIELD_INDEX.camSpeed];
        const value = Number(raw);
        if (typeof raw !== "string" || raw.trim() === "" || isNaN(value) || value <= 0) {
            notifyPlayer(player, "dbg.rc2.mes.invalid.speed.value", "note.bass");
            settingsData.camSpeed = settingsData.camSpeed ?? 2;
            return;
        }
        settingsData.camSpeed = value;

        settingsData.easeType = Number(values[FIELD_INDEX.easeType]);

        settingsData.camFacingType = Number(values[FIELD_INDEX.camFacingType]);
        settingsData.camFacingX = Number(values[FIELD_INDEX.camFacingX]);
        settingsData.camFacingY = Number(values[FIELD_INDEX.camFacingY]);

        settingsData.hideHud = Boolean(values[FIELD_INDEX.hideHud]);

        settingsDataMap.set(player.id, settingsData);
        cinematicSettingsDB.set(player.id, settingsData);

        notifyPlayer(player, "dbg.rc2.mes.settings.have.been.saved.successfully", "random.orb");
    });
}

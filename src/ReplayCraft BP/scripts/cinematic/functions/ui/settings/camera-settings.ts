import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { settingsDataMap, cineRuntimeDataMap } from "../../../data/maps";
import { easeTypes } from "../../../data/constants/constants";

// Small helper to avoid repeating message + sound
function notifyPlayer(player: Player, translationKey: string, sound: string = "note.bass") {
    player.sendMessage({ translate: translationKey });
    player.playSound(sound);
}

export function cameraSettings(player: Player) {
    const otherData = cineRuntimeDataMap.get(player.id);
    if (otherData?.isCameraInMotion) {
        notifyPlayer(player, "dbg.rc2.mes.cannot.change.settings.while.camera.is.in.motion");
        return;
    }

    const settingsData = settingsDataMap.get(player.id);

    const FIELD_INDEX = {
        easeType: 2,
        easeTime: 3,
        camFacingType: 6,
        camFacingX: 7,
        camFacingY: 8,
        hideHud: 11
    } as const;

    const form = new ModalFormData()
        .title("dbg.rc2.title.camera.settings")
        .divider()
        .label("dbg.rc2.lebel.easing.settings")
        .dropdown("dbg.rc2.dropdown.ease.type", easeTypes, {
            defaultValueIndex: settingsData.easeType,
        })
        .textField("dbg.rc2.textfield.ease.time", String(isFinite(settingsData.easetime) && settingsData.easetime > 0 ? settingsData.easetime : 1))
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
        settingsData.easeType = Number(values[FIELD_INDEX.easeType]);

        const parsedTime = Number(values[FIELD_INDEX.easeTime]);
        settingsData.easetime = isNaN(parsedTime) || parsedTime <= 0 ? 1 : Math.floor(parsedTime);

        settingsData.camFacingType = Number(values[FIELD_INDEX.camFacingType]);
        settingsData.camFacingX = Number(values[FIELD_INDEX.camFacingX]);
        settingsData.camFacingY = Number(values[FIELD_INDEX.camFacingY]);

        settingsData.hideHud = Boolean(values[FIELD_INDEX.hideHud]);

        notifyPlayer(player, "dbg.rc2.mes.settings.have.been.saved.successfully", "random.orb");
    });
}

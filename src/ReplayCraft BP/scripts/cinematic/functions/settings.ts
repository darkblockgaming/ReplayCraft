import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { settingsDataMap, otherDataMap } from "../data/maps";
import { easeTypes, particlesName } from "../data/constants/constants";

export function cineSettings(player: Player) {
    const otherData = otherDataMap.get(player.id);
    const settingsData = settingsDataMap.get(player.id);
    if (otherData.isCameraInMotion === true) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "dbg.rc2.mes.cannot.change.settings.while.camera.is.in.motion",
        });
        return;
    }
    const replaySettingsForm = new ModalFormData()
        .title("dbg.rc2.title.settings")
        .dropdown("dbg.rc2.dropdown.camera.settings.ease.type", easeTypes, { defaultValueIndex: settingsData.easeType })
        .textField("dbg.rc2.textfield.time", String(isFinite(settingsData.easetime) && settingsData.easetime > 0 ? settingsData.easetime : 1))
        .dropdown("dbg.rc2.dropdown.camera.facing", ["Default", "Custom Rotation `Select Below`", "Focus On Player"], { defaultValueIndex: settingsData.camFacingType })

        .slider({ rawtext: [{ translate: "dbg.rc2.slider.pitch" }] }, -90, 90, {
            valueStep: 1,
            defaultValue: settingsData.camFacingX,
        })
        .slider({ rawtext: [{ translate: "dbg.rc2.slider.yaw" }] }, 0, 360, {
            valueStep: 1,
            defaultValue: settingsData.camFacingY,
        })
        .dropdown("dbg.rc2.dropdown.particle.Settings.frame.particle.type", particlesName, { defaultValueIndex: settingsData.cineParType })
        .toggle("dbg.rc2.toggle.enable.position.frame.particles", { defaultValue: settingsData.cineParSwitch })
        .toggle("dbg.rc2.toggle.hide.hud", { defaultValue: settingsData.hideHud })

        .slider({ rawtext: [{ translate: "dbg.rc2.slider.preview.settings.preview.speed.multiplier" }] }, 1, 10, {
            valueStep: 1,
            defaultValue: settingsData.cinePrevSpeedMult,
        })
        //.toggle("\n§l§g- Fade Screen Settings§r\n\nFade Screen", settingsData.cineFadeSwitch)

        .slider({ rawtext: [{ translate: "dbg.rc2.slider.fade.screen.settings.red.value" }] }, 0, 255, {
            valueStep: 1,
            defaultValue: settingsData.cineRedValue,
        })
        .slider({ rawtext: [{ translate: "dbg.rc2.slider.green.value" }] }, 0, 255, {
            valueStep: 1,
            defaultValue: settingsData.cineGreenValue,
        })
        .slider({ rawtext: [{ translate: "dbg.rc2.slider.blue.value" }] }, 0, 255, {
            valueStep: 1,
            defaultValue: settingsData.cineBlueValue,
        });
    replaySettingsForm.show(player).then((response: any) => {
        if (response.canceled) {
            player.sendMessage({
                translate: "dbg.rc2.mes.please.click.submit",
            });
            player.playSound("note.bass");
            return;
        }
        settingsData.easeType = Number(response.formValues[0]);
        const parsed = Number(response.formValues[1]);
        settingsData.easetime = isNaN(parsed) || parsed <= 0 ? 1 : Math.floor(parsed);
        settingsData.camFacingType = Number(response.formValues[2]);
        settingsData.camFacingX = Number(response.formValues[3]);
        settingsData.camFacingY = Number(response.formValues[4]);
        settingsData.cineParType = Number(response.formValues[5]);
        settingsData.cineParSwitch = Boolean(response.formValues[6]);
        settingsData.hideHud = Boolean(response.formValues[7]);
        settingsData.cinePrevSpeedMult = Number(response.formValues[8]);
        settingsData.cinePrevSpeed = Number(Math.round((1 / settingsData.cinePrevSpeedMult) * 10) / 10);
        //settingsData.cineFadeSwitch = response.formValues[8];
        settingsData.cineRedValue = Number(response.formValues[9]);
        settingsData.cineGreenValue = Number(response.formValues[10]);
        settingsData.cineBlueValue = Number(response.formValues[11]);
        player.sendMessage({
            translate: "dbg.rc2.mes.settings.have.been.saved.successfully",
        });
    });
}

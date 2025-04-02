
import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../main";
import { Player } from "@minecraft/server";
export function previewSettings(player: Player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.wait.for.replay.preview.end"
                }]
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.preview.settings")
        .dropdown("dbg.rc1.dropdown.title.preview.type", ["Default Preview", "Ghost Preview"], SharedVariables.settReplayType)
        .dropdown("dbg.rc1.dropdown.title.preview.skin.type", SharedVariables.skinTypes, SharedVariables.choosenReplaySkin)
        .dropdown("dbg.rc1.dropdown.title.name.of.preview.player", ["Disable", "Player's Name", "Custom Name"], SharedVariables.settNameType)
        .textField("dbg.rc1.textfield.title.custom.name", SharedVariables.settCustomName)


    replaySettingsForm.show(player).then(response => {
        if (response.canceled) {
            if (SharedVariables.textPrompt) {
                player.onScreenDisplay.setActionBar({
                    "rawtext": [{
                        "translate": "dbg.rc1.mes.please.click.submit"
                    }]
                });
            }
            if (SharedVariables.soundCue) {
                player.playSound("note.bass");
            }
            return;
        }
        SharedVariables.settReplayType = Number(response.formValues[0]);
        SharedVariables.choosenReplaySkin = Number(response.formValues[1]);
        SharedVariables.settNameType = Number(response.formValues[2]);
        SharedVariables.settCustomName = String(response.formValues[3]);
    })
}
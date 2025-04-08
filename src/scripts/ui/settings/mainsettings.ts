
import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../main";
import { Player } from "@minecraft/server";

export function mainSettings(player: Player) {
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.replaycraft.settings")
        .toggle(`dbg.rc1.toggle.sound.cues`, SharedVariables.soundCue)
        .toggle(`dbg.rc1.toggle.text.prompts`, SharedVariables.textPrompt)
        .dropdown(`dbg.rc1.dropdown.select.block.placing.sound`, SharedVariables.soundIds, SharedVariables.selectedSound)
        .toggle(`dbg.rc1.toggle.block.placing.sound`, SharedVariables.toggleSound)
        .toggle(`dbg.rc1.toggle.hide.hud.on.replay`,SharedVariables.hideHUD);

    replaySettingsForm.show(player).then(response => {
        if (response.canceled) {
            if (SharedVariables.textPrompt) {
                player.sendMessage({
                    "rawtext": [{
                        "translate": "dbg.rc1.mes.please.click.submit"
                    }]
                });
            }
            player.playSound("note.bass");
            return;
        }
        SharedVariables.soundCue = Boolean(response.formValues[0]);
        SharedVariables.textPrompt = Boolean(response.formValues[1]);
        SharedVariables.selectedSound = Number(response.formValues[2]);
        SharedVariables.toggleSound = Boolean(response.formValues[3]);
        SharedVariables.hideHUD = Boolean(response.formValues[4]);
    })
}

import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../../main";

export function mainSettings(player) {
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.replaycraft.settings")
        .toggle(`dbg.rc1.toggle.sound.cues`, SharedVariables.soundCue)
        .toggle(`dbg.rc1.toggle.text.prompts`, SharedVariables.textPrompt)
        .dropdown(`dbg.rc1.dropdown.select.block.placing.sound`, SharedVariables.soundIds, SharedVariables.selectedSound)
        .toggle(`dbg.rc1.toggle.block.placing.sound`, SharedVariables.toggleSound);

    replaySettingsForm.show(player).then(response => {
        if (response.canceled) {
            if (SharedVariables.textPrompt) {
                player.onScreenDisplay.setActionBar({
                    "rawtext": [{
                        "translate": "dbg.rc1.mes.please.click.submit"
                    }]
                });
            }
            player.playSound("note.bass");
            return;
        }
        SharedVariables.soundCue = response.formValues[0];
        SharedVariables.textPrompt = response.formValues[1];
        SharedVariables.selectedSound = response.formValues[2];
        SharedVariables.toggleSound = response.formValues[3];
    })
}
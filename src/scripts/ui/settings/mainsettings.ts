import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";

export function mainSettings(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.replaycraft.settings")
        .toggle(`dbg.rc1.toggle.sound.cues`, { defaultValue: session.soundCue })
        .toggle(`dbg.rc1.toggle.text.prompts`, { defaultValue: session.textPrompt })
        .dropdown(`dbg.rc1.dropdown.select.block.placing.sound`, session.soundIds, { defaultValueIndex: session.selectedSound })
        .toggle(`dbg.rc1.toggle.block.placing.sound`, { defaultValue: session.toggleSound })
        .toggle(`dbg.rc1.toggle.hide.hud.on.replay`, { defaultValue: session.hideHUD });

    replaySettingsForm.show(player).then((response) => {
        if (response.canceled) {
            if (session.textPrompt) {
                player.sendMessage({
                    rawtext: [
                        {
                            translate: "dbg.rc1.mes.please.click.submit",
                        },
                    ],
                });
            }
            player.playSound("note.bass");
            return;
        }
        session.soundCue = Boolean(response.formValues[0]);
        session.textPrompt = Boolean(response.formValues[1]);
        session.selectedSound = Number(response.formValues[2]);
        session.toggleSound = Boolean(response.formValues[3]);
        session.hideHUD = Boolean(response.formValues[4]);
    });
}

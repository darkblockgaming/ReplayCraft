import * as ui from "@minecraft/server-ui";
import { replaySessions } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";

export function mainSettings(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.replaycraft.settings")
        .toggle(`dbg.rc1.toggle.sound.cues`, { defaultValue: session.soundCue })
        .toggle(`dbg.rc1.toggle.text.prompts`, { defaultValue: session.textPrompt })
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
        session.toggleSound = Boolean(response.formValues[3]);
        session.hideHUD = Boolean(response.formValues[4]);
    });
}

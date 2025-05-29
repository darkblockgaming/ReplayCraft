import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";
export function previewSettings(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    if (session.currentSwitch === true) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.wait.for.replay.preview.end",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.preview.settings")
        .dropdown("dbg.rc1.dropdown.title.preview.type", ["Default Preview", "Ghost Preview"], { defaultValueIndex: session.settReplayType })
        .dropdown("dbg.rc1.dropdown.title.preview.skin.type", session.skinTypes, { defaultValueIndex: session.chosenReplaySkin })
        .dropdown("dbg.rc1.dropdown.title.name.of.preview.player", ["Disable", "Player's Name", "Custom Name"], { defaultValueIndex: session.settNameType })
        .textField("dbg.rc1.textfield.title.custom.name", session.settCustomName);

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
            if (session.soundCue) {
                player.playSound("note.bass");
            }
            return;
        }
        session.settReplayType = Number(response.formValues[0]);
        session.chosenReplaySkin = Number(response.formValues[1]);
        session.settNameType = Number(response.formValues[2]);
        session.settCustomName = String(response.formValues[3]);
    });
}

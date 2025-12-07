import * as ui from "@minecraft/server-ui";
import { replaySessions } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";

export function replaySettings(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    if (session.isReplayActive === true) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "rc1.mes.please.wait.for.replay.to.be.completed",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    const playerName = session.trackedPlayers.map((player: Player) => player.name);
    const replaySettingsForm = new ui.ModalFormData()
        .title("rc1.title.replay.settings")
        .dropdown("rc1.dropdown.title.replay.type", ["Default Replay", "Ghost Replay"], { defaultValueIndex: session.settingReplayType })
        .dropdown("rc1.dropdown.title.replay.skin.type", session.skinTypes, { defaultValueIndex: session.chosenReplaySkin })
        .dropdown("rc1.dropdown.title.name.of.replay.player", ["Disable", "Player's Name", "Custom Name"], { defaultValueIndex: session.settingNameType })
        .textField("rc1.textfield.custom.name", session.settingCustomName)
        .dropdown("rc1.dropdown.title.camera.ease.type", session.easeTypes, { defaultValueIndex: session.replayCamEase })
        .dropdown("rc1.dropdown.title.camera.type", ["None (Free Cam)", "Cinematic Cam", "Focus Cam", "Top-Down Focus (Fixed)", "Top-Down Focus (Dynamic)"], { defaultValueIndex: session.settingCameraType })
        .dropdown("rc1.dropdown.title.focus.on.player", playerName, { defaultValueIndex: session.focusPlayerSelection })
        .dropdown("rc1.dropdown.title.affect.camera.of.players", ["All Players", ...playerName], { defaultValueIndex: session.affectCameraSelection })
        .slider("drop.title.topdown.cam.height", 2, 20, { valueStep: 1, defaultValue: session.topDownCamHight });

    replaySettingsForm.show(player).then((response) => {
        if (response.canceled) {
            if (session.textPrompt) {
                player.sendMessage({
                    rawtext: [
                        {
                            translate: "rc1.mes.please.click.submit",
                        },
                    ],
                });
            }
            if (session.soundCue) {
                player.playSound("note.bass");
            }
            return;
        }
        session.settingReplayType = Number(response.formValues[0]);
        session.chosenReplaySkin = Number(response.formValues[1]);
        session.settingNameType = Number(response.formValues[2]);
        session.settingCustomName = String(response.formValues[3]);
        session.replayCamEase = Number(response.formValues[4]);
        session.settingCameraType = Number(response.formValues[5]);
        session.focusPlayerSelection = Number(response.formValues[6]);
        session.cameraFocusPlayer = session.trackedPlayers[session.focusPlayerSelection];
        session.affectCameraSelection = Number(response.formValues[7]);
        if (session.affectCameraSelection === 0) {
            session.cameraAffectedPlayers = session.trackedPlayers;
        } else {
            session.cameraAffectedPlayers = [];
            session.cameraAffectedPlayers[0] = session.trackedPlayers[session.affectCameraSelection - 1];
        }
        session.topDownCamHight = Number(response.formValues[8]);
    });
}

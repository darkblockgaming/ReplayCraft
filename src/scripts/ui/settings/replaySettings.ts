import * as ui from "@minecraft/server-ui";
import { replaySessions } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";

export function replaySettings(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    if (session.currentSwitch === true) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.please.wait.for.replay.to.be.completed",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    const playerName = session.multiPlayers.map((player: Player) => player.name);
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.replay.settings")
        .dropdown("dbg.rc1.dropdown.title.replay.type", ["Default Replay", "Ghost Replay"], { defaultValueIndex: session.settReplayType })
        .dropdown("dbg.rc1.dropdown.title.replay.skin.type", session.skinTypes, { defaultValueIndex: session.chosenReplaySkin })
        .dropdown("dbg.rc1.dropdown.title.name.of.replay.player", ["Disable", "Player's Name", "Custom Name"], { defaultValueIndex: session.settNameType })
        .textField("dbg.rc1.textfield.custom.name", session.settCustomName)
        .dropdown("dbg.rc1.dropdown.title.camera.ease.type", session.easeTypes, { defaultValueIndex: session.replayCamEase })
        .dropdown("dbg.rc1.dropdown.title.camera.type", ["None (Free Cam)", "Cinematic Cam", "Focus Cam", "Top-Down Focus (Fixed)", "Top-Down Focus (Dynamic)"], { defaultValueIndex: session.settCameraType })
        .dropdown("dbg.rc1.dropdown.title.focus.on.player", playerName, { defaultValueIndex: session.focusPlayerSelection })
        .dropdown("dbg.rc1.dropdown.title.affect.camera.of.players", ["All Players", ...playerName], { defaultValueIndex: session.affectCameraSelection })
        .slider("drop.title.topdown.cam.height", 2, 20, { valueStep: 1, defaultValue: session.topDownCamHight });

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
        session.replayCamEase = Number(response.formValues[4]);
        session.settCameraType = Number(response.formValues[5]);
        session.focusPlayerSelection = Number(response.formValues[6]);
        session.dbgCamFocusPlayer = session.multiPlayers[session.focusPlayerSelection];
        session.affectCameraSelection = Number(response.formValues[7]);
        if (session.affectCameraSelection === 0) {
            session.dbgCamAffectPlayer = session.multiPlayers;
        } else {
            session.dbgCamAffectPlayer = [];
            session.dbgCamAffectPlayer[0] = session.multiPlayers[session.affectCameraSelection - 1];
        }
        session.topDownCamHight = Number(response.formValues[8]);
    });
}

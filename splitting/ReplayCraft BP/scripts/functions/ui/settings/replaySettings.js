
import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../../main";

export function replaySettings(player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.please.wait.for.replay.to.be.completed"
                }]
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    const playerName = SharedVariables.multiPlayers.map(player => player.name);
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.replay.settings")
        .dropdown("dbg.rc1.dropdown.title.replay.type", ["Default Replay", "Ghost Replay"], SharedVariables.settReplayType)
        .dropdown("dbg.rc1.dropdown.title.replay.skin.type", SharedVariables.skinTypes, SharedVariables.choosenReplaySkin)
        .dropdown("dbg.rc1.dropdown.title.name.of.replay.player", ["Disable", "Player's Name", "Custom Name"], SharedVariables.settNameType)
        .textField("dbg.rc1.textfield.custom.name", SharedVariables.settCustomName)
        .dropdown("dbg.rc1.dropdown.title.camera.ease.type", SharedVariables.easeTypes, SharedVariables.replayCamEase)
        .dropdown("dbg.rc1.dropdown.title.camera.type", ["None (Free Cam)", "Cinematic Cam", "Focus Cam", "Top-Down Focus (Fixed)", "Top-Down Focus (Dynamic)"], SharedVariables.settCameraType)
        .dropdown("dbg.rc1.dropdown.title.focus.on.player", playerName, SharedVariables.focusPlayerSelection)
        .dropdown("dbg.rc1.dropdown.title.affect.camera.of.players", ["All Players", ...playerName], SharedVariables.affectCameraSelection)
        .slider("drop.title.topdown.cam.height", 2, 20, 1, SharedVariables.topDownCamHight);


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
        SharedVariables.settReplayType = response.formValues[0];
        SharedVariables.choosenReplaySkin = response.formValues[1]
        SharedVariables.settNameType = response.formValues[2];
        SharedVariables.settCustomName = response.formValues[3];
        SharedVariables.replayCamEase = response.formValues[4];
        SharedVariables.settCameraType = response.formValues[5];
        SharedVariables.focusPlayerSelection = response.formValues[6];
        SharedVariables.dbgCamFocusPlayer = SharedVariables.multiPlayers[SharedVariables.focusPlayerSelection];
        SharedVariables.affectCameraSelection = response.formValues[7];
        if (SharedVariables.affectCameraSelection === 0) {
            SharedVariables.dbgCamAffectPlayer = SharedVariables.multiPlayers;
        } else {
            SharedVariables.dbgCamAffectPlayer = [];
            SharedVariables.dbgCamAffectPlayer[0] = SharedVariables.multiPlayers[SharedVariables.affectCameraSelection - 1];
        }
        SharedVariables.topDownCamHight = response.formValues[8];
    })
}
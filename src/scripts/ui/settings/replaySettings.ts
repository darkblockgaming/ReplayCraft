
import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../main";
import { Player } from "@minecraft/server";

export function replaySettings(player: Player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.sendMessage({
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
    const playerName = SharedVariables.multiPlayers.map((player: Player) => player.name);
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.replay.settings")
        .dropdown("dbg.rc1.dropdown.title.replay.type", ["Default Replay", "Ghost Replay"], {defaultValueIndex: SharedVariables.settReplayType})
        //.dropdown("dbg.rc1.dropdown.title.replay.skin.type", SharedVariables.skinTypes, {defaultValueIndex: SharedVariables.choosenReplaySkin})
        .dropdown("dbg.rc1.dropdown.title.name.of.replay.player", ["Disable", "Player's Name", "Custom Name"], {defaultValueIndex: SharedVariables.settNameType})
        .textField("dbg.rc1.textfield.custom.name", SharedVariables.settCustomName)
        .dropdown("dbg.rc1.dropdown.title.camera.ease.type", SharedVariables.easeTypes, {defaultValueIndex: SharedVariables.replayCamEase})
        .dropdown("dbg.rc1.dropdown.title.camera.type", ["None (Free Cam)", "Cinematic Cam", "Focus Cam", "Top-Down Focus (Fixed)", "Top-Down Focus (Dynamic)"], {defaultValueIndex: SharedVariables.settCameraType})
        .dropdown("dbg.rc1.dropdown.title.focus.on.player", playerName, {defaultValueIndex: SharedVariables.focusPlayerSelection})
        .dropdown("dbg.rc1.dropdown.title.affect.camera.of.players", ["All Players", ...playerName], {defaultValueIndex: SharedVariables.affectCameraSelection})
        .slider("drop.title.topdown.cam.height", 2, 20, {valueStep: 1,defaultValue: SharedVariables.topDownCamHight});


    replaySettingsForm.show(player).then(response => {
        if (response.canceled) {
            if (SharedVariables.textPrompt) {
                player.sendMessage({
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
        //SharedVariables.choosenReplaySkin = Number (response.formValues[1]);
        SharedVariables.settNameType = Number(response.formValues[1]);;
        SharedVariables.settCustomName = String(response.formValues[2]);
        SharedVariables.replayCamEase = Number(response.formValues[3]);
        SharedVariables.settCameraType = Number(response.formValues[4]);
        SharedVariables.focusPlayerSelection = Number(response.formValues[5]);
        SharedVariables.dbgCamFocusPlayer = SharedVariables.multiPlayers[SharedVariables.focusPlayerSelection];
        SharedVariables.affectCameraSelection = Number(response.formValues[6]);
        if (SharedVariables.affectCameraSelection === 0) {
            SharedVariables.dbgCamAffectPlayer = SharedVariables.multiPlayers;
        } else {
            SharedVariables.dbgCamAffectPlayer = [];
            SharedVariables.dbgCamAffectPlayer[0] = SharedVariables.multiPlayers[SharedVariables.affectCameraSelection - 1];
        }
        SharedVariables.topDownCamHight = Number(response.formValues[7]);
    })
}
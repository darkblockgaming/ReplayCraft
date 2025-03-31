
import { SharedVariables } from "../../main";

export function doCamSetupGoBack(player) {
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
    SharedVariables.replayStateMachine.setState("recCamSetup");
    SharedVariables.replayCamPos = [];
    SharedVariables.replayCamRot = [];
    SharedVariables.wantLoadFrameTick = 0;
    if (SharedVariables.textPrompt) {
        player.onScreenDisplay.setActionBar({
            "rawtext": [{
                "translate": "dbg.rc1.mes.please.do.the.cinematic.camera.setup"
            }]
        });
    }
}
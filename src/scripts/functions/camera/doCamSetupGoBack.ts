
import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";

export function doCamSetupGoBack(player: Player) {
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
    SharedVariables.replayStateMachine.setState("recCamSetup");
    SharedVariables.replayCamPos = [];
    SharedVariables.replayCamRot = [];
    SharedVariables.wantLoadFrameTick = 0;
    if (SharedVariables.textPrompt) {
        player.sendMessage({
            "rawtext": [{
                "translate": "dbg.rc1.mes.please.do.the.cinematic.camera.setup"
            }]
        });
    }
}
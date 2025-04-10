import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";

export function doCamSetup(player: Player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.sendMessage({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.please.wait.for.replay.prev.to.be.completed"
                }]
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    SharedVariables.replayStateMachine.setState("recCamSetup");
    if (SharedVariables.textPrompt) {
        player.sendMessage({
            "rawtext": [{
                "translate": "dbg.rc1.mes.please.do.the.cinematic.camera.setup"
            }]
        });
    }
    if (SharedVariables.soundCue) {
        player.playSound("random.orb");
    }
}
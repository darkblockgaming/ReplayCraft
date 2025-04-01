import { SharedVariables } from "../../main";

export function doCamSetup(player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.onScreenDisplay.setActionBar({
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
        player.onScreenDisplay.setActionBar({
            "rawtext": [{
                "translate": "dbg.rc1.mes.please.do.the.cinematic.camera.setup"
            }]
        });
    }
    if (SharedVariables.soundCue) {
        player.playSound("random.orb");
    }
}
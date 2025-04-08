
import { SharedVariables } from "../../main";
export function doPause(player) {
    SharedVariables.replayStateMachine.setState("recPaused");
    if (SharedVariables.textPrompt) {
        player.onScreenDisplay.setActionBar({
            "rawtext": [{
                "translate": "dbg.rc1.mes.rec.paused.successfully"
            }]
        });
    }
}
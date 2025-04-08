
import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";
export function doPause(player: Player) {
    SharedVariables.replayStateMachine.setState("recPaused");
    if (SharedVariables.textPrompt) {
        player.onScreenDisplay.setActionBar({
            "rawtext": [{
                "translate": "dbg.rc1.mes.rec.paused.successfully"
            }]
        });
    }
}
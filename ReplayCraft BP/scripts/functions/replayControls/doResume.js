import { SharedVariables } from "../../main";
export function doResume(player) {
    SharedVariables.replayStateMachine.setState("recPending");
    SharedVariables.dbgRecController = player;
    if (SharedVariables.textPrompt) {
        player.onScreenDisplay.setActionBar({
            "rawtext": [{
                "translate": "dbg.rc1.mes.rec.resumed.successfully"
            }]
        });
    }
}
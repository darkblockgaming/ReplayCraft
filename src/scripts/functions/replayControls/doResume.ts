import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";
export function doResume(player: Player) {
    SharedVariables.replayStateMachine.setState("recPending");
    SharedVariables.dbgRecController = player;
    if (SharedVariables.textPrompt) {
        player.sendMessage({
            "rawtext": [{
                "translate": "dbg.rc1.mes.rec.resumed.successfully"
            }]
        });
    }
}

import { SharedVariables } from "../../main";
import { removeEntities } from "../removeEntities";
import { resetRec } from "./resetRec";

export function doStart(player) {
    SharedVariables.multiPlayers.forEach((player) => {
        removeEntities(player);
        resetRec(player);
    });
    SharedVariables.replayStateMachine.setState("recPending");
    SharedVariables.dbgRecController = player;
    if (SharedVariables.multiToggle === false) {
        SharedVariables.dbgCamFocusPlayer = SharedVariables.dbgRecController;
        SharedVariables.dbgCamAffectPlayer[0] = SharedVariables.dbgRecController;
    }
    if (SharedVariables.multiToggle === true) {
        SharedVariables.dbgCamAffectPlayer = SharedVariables.multiPlayers;
    }
    if (SharedVariables.textPrompt) {
        //player.onScreenDisplay.setActionBar("dbg.rc1.message.recording.has.started");
        player.onScreenDisplay.setActionBar({
            "rawtext": [{
                "translate": "dbg.rc1.mes.rec.has.started"
            }]
        });
    }
}
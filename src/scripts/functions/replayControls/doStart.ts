
import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { removeEntities } from "../removeEntities";
import { resetRec } from "./resetRec";

export function doStart(player:Player) {
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
        player.sendMessage({
            "rawtext": [{
                "translate": "dbg.rc1.mes.rec.has.started"
            }]
        });
    }
}
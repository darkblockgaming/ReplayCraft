
import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { resetCamSetup } from "../camera/resetCamSetup";
import { clearStructure } from "../clearStructure";
import { removeEntities } from "../removeEntities";
import { resetRec } from "./resetRec";

export function deletePro(player: Player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.sendMessage({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.please.wait.for.replay.or.preview.to.be.completed"
                }]
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    resetCamSetup(player);
    SharedVariables.replayStateMachine.setState("default");
    SharedVariables.multiPlayers.forEach((player) => {
        removeEntities(player,false);
        clearStructure(player);
        resetRec(player);
    });
}
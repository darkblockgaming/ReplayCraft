
import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { clearStructure } from "../clearStructure";
import { removeEntities } from "../removeEntities";

export function doProceedFurther(player: Player) {
    if (SharedVariables.replayCamPos.length <= 1) {
        if (SharedVariables.textPrompt) {
            player.sendMessage({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.at.least.two.camera.points.are.recommended"
                }]
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    SharedVariables.replayStateMachine.setState("recCompleted");
    SharedVariables.multiPlayers.forEach((player) => {
        clearStructure(player);
    });
   removeEntities(player, false);
}

import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { clearStructure } from "../clearStructure";

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
    const entities = player.dimension.getEntities({
        type: "dbg:replayentity"
    });
    entities.forEach(entity => {
        entity.remove();
    });
    const entities2 = player.dimension.getEntities({
        type: "dbg:rccampos"
    });
    entities2.forEach(entity2 => {
        entity2.remove();
    });
}
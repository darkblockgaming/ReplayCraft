import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { clearStructure } from "../clearStructure";


export function doStopPreview(player: Player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.sendMessage({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.replay.preview.has.stopped.successfully"
                }]
            });
        }
        SharedVariables.replayStateMachine.setState("recSaved");

        SharedVariables.multiPlayers.forEach((player) => {
            const customEntity = SharedVariables.replayODataMap.get(player.id);
            customEntity.remove();
            clearStructure(player);
        });

        SharedVariables.lilTick = 0;
        SharedVariables.currentSwitch = false;
        return;
    } else {
        if (SharedVariables.textPrompt) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.replay.preview.is.already.off"
                }]
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
    }
}
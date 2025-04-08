

import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { doStopCamera } from "../camera/doStopCamera";
import { clearStructure } from "../clearStructure";

export function doStopReplay(player: Player) {
    if (SharedVariables.currentSwitch === false) {
        if (SharedVariables.textPrompt) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.replay.is.already.stopped"
                }]
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    SharedVariables.replayStateMachine.setState("recCompleted");
    if (SharedVariables.settReplayType === 0) {
        SharedVariables.multiPlayers.forEach((player) => {

            SharedVariables.followCamSwitch = false;
            SharedVariables.topDownCamSwitch = false;
            SharedVariables.topDownCamSwitch2 = false;

            const customEntity = SharedVariables.replayODataMap.get(player.id);
            customEntity.remove();
            clearStructure(player);

            player.camera.clear();
    //player.runCommand(`camera @s clear`);
            doStopCamera(player);
        });
    }
    SharedVariables.lilTick = 0;
    SharedVariables.currentSwitch = false;

    if (SharedVariables.textPrompt) {
        player.onScreenDisplay.setActionBar({
            "rawtext": [{
                "translate": "dbg.rc1.mes.replay.stopped"
            }]
        });
    }
}
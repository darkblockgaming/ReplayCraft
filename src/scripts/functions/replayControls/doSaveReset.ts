
import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { resetCamSetup } from "../camera/resetCamSetup";
import { clearStructure } from "../clearStructure";
import { loadBlocksUpToTick } from "../loadBlocksUpToTick";
import { removeEntities } from "../removeEntities";
import { resetRec } from "./resetRec";

export async function doSaveReset(player: Player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{ "translate": "dbg.rc1.mes.please.wait.for.replay.or.preview.to.be.completed" }]
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    resetCamSetup(player);
    SharedVariables.replayStateMachine.setState("default");

    // Wait for `clearStructure()` to finish before proceeding
    await clearStructure(player); 

    // Then remove entities
    removeEntities(player);

    // Now safely load blocks
    await loadBlocksUpToTick(SharedVariables.dbgRecTime, player);

    // Final reset
    resetRec(player);
}
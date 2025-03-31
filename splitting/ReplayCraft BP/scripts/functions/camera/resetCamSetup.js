
import { SharedVariables } from "../../main";
import { clearStructure } from "../clearStructure";
import { removeEntities } from "../removeEntities";

export function resetCamSetup(player) {
    SharedVariables.multiPlayers.forEach((player) => {
        clearStructure(player);
        removeEntities(player);
    });
    SharedVariables.currentSwitch = false;
    SharedVariables.frameLoaded = false;
    SharedVariables.replayCamPos = [];
    SharedVariables.replayCamRot = [];
    SharedVariables.wantLoadFrameTick = 0;
    player.onScreenDisplay.setActionBar({
        "rawtext": [{
            "translate": "dbg.rc1.mes.interaction.successfull"
        }]
    });
    SharedVariables.frameLoaded = false;
    SharedVariables.startingValueTick = 0;
    SharedVariables.startingValueSecs = 0;
    SharedVariables.startingValueMins = 0;
    SharedVariables.startingValueHrs = 0;
}
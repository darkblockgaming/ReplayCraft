//@ts-check
import { SharedVariables } from "../../main";

export function resetRec(player) {
    SharedVariables.dbgRecController = undefined;
    SharedVariables.currentSwitch = false;
    SharedVariables.dbgRecTime = 0;
    SharedVariables.lilTick = 0;
    SharedVariables.replaySpeed = 1;
    SharedVariables.replayBDataMap.set(player.id, {
        dbgBlockData: {},
    });
    SharedVariables.replayBDataBMap.set(player.id, {
        dbgBlockDataB: {}
    });
    SharedVariables.replayBData1Map.set(player.id, {
        dbgBlockData1: {}
    });
    SharedVariables.replayPosDataMap.set(player.id, {
        dbgRecPos: []
    });
    SharedVariables.replayRotDataMap.set(player.id, {
        dbgRecRot: []
    });
    SharedVariables.replayMDataMap.set(player.id, {
        isSneaking: []
    });
    SharedVariables.replayODataMap.set(player.id, {
        customEntity: undefined
    });
    SharedVariables.replaySDataMap.set(player.id, {
        weapon1: [],
        weapon2: [],
        armor1: [],
        armor2: [],
        armor3: [],
        armor4: []
    });
}
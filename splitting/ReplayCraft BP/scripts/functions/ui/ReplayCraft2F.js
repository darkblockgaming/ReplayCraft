
import * as ui from "@minecraft/server-ui";
import { doCamSetupGoBack } from "../camera/doCamSetupGoBack";
import { doReplay } from "../replayControls/doReplay";
import { doStopReplay } from "../replayControls/doStopReplay";
import { cancelRec } from "./cancelRec";
import { replaySettings } from "./settings/replaySettings";
export function ReplayCraft2F(player) { //if SharedVariables.replayStateMachine.state = recSaved
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.start.replay") //0
        .button("dbg.rc1.button.stop.replay") //1
        .button("dbg.rc1.button.settings") //2
        .button("dbg.rc1.button.goback.camsetup") //3
        .button("dbg.rc1.button.load.structure.or.reset") //4
        .body("dbg.rc1.body.2f");
    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => doReplay(player),
            1: () => doStopReplay(player),
            2: () => replaySettings(player),
            3: () => doCamSetupGoBack(player),
            4: () => cancelRec(player),
        };
        const selectedAction = actions[result.selection];
        if (selectedAction) {
            selectedAction();
        }
    });
}

import * as ui from "@minecraft/server-ui";
import { doSave } from "../replayControls/doSave";
import { doPause } from "../replayControls/doPause";
import { cancelRec } from "./cancelRec";
export function ReplayCraft2B(player) { //if SharedVariables.replayStateMachine.state = recPending 
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.save.recording") //0
        .button("dbg.rc1.button.pause.recording") //1
        .button("dbg.rc1.button.cancel.recording") //2
        .body("dbg.rc1.body.2b");
    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => doSave(player),
            1: () => doPause(player),
            2: () => cancelRec(player),
        };
        const selectedAction = actions[result.selection];
        if (selectedAction) {
            selectedAction();
        }
    });
}
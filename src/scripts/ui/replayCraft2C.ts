
import * as ui from "@minecraft/server-ui";
import { cancelRec } from "./cancelRec";
import { Player } from "@minecraft/server";
import { doSave } from "../functions/replayControls/doSave";
import { doResume } from "../functions/replayControls/doResume";
export function ReplayCraft2C(player: Player) { //if SharedVariables.replayStateMachine.state = recPaused
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.save.recording") //0
        .button("dbg.rc1.button.resume.recording") //1
        .button("dbg.rc1.button.cancel.recording") //2
        .body("dbg.rc1.body.2c");
    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => doSave(player),
            1: () => doResume(player),
            2: () => cancelRec(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}
import * as ui from "@minecraft/server-ui";
import { cancelRec } from "./cancel-recording";
import { Player } from "@minecraft/server";
import { doSave } from "../functions/replayControls/save-replay-recording";
import { doResume } from "../functions/replayControls/pause-replay-recording";
export function ReplayCraft2C(player: Player) {
    //if SharedVariables.replayStateMachine.state = recPaused
    const replayForm = new ui.ActionFormData()
        .title("rc1.recordingmenu.title")
        .button("rc1.button.save.recording") //0
        .button("rc1.button.resume.recording") //1
        .button("rc1.button.cancel.recording") //2
        .body("rc1.body.2c");
    replayForm.show(player).then((result) => {
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

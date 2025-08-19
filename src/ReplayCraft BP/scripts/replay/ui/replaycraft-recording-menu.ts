import * as ui from "@minecraft/server-ui";
import { cancelRec } from "./cancel-recording";
import { Player } from "@minecraft/server";
import { doSave } from "../functions/replayControls/save-replay-recording";
import { doPause } from "../functions/replayControls/pause-replay-playback";
export function ReplayCraft2B(player: Player) {
    //if SharedVariables.replayStateMachine.state = recPending
    const replayForm = new ui.ActionFormData()
        .title("replaycraft.recordingmenu.title")
        .button("dbg.rc1.button.save.recording") //0
        .button("dbg.rc1.button.pause.recording") //1
        .button("dbg.rc1.button.cancel.recording") //2
        .body("dbg.rc1.body.2b");
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => doSave(player),
            1: () => doPause(player),
            2: () => cancelRec(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

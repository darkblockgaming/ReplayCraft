
import * as ui from "@minecraft/server-ui";
import { previewSettings } from "./settings/previewSettings";
import { doCamSetup } from "../camera/doCamSetup";
import { doStopPreview } from "../replayControls/doStopPreview";
import { doViewReplay } from "../replayControls/doViewReplay";
import { cancelRec } from "./cancelRec";
export function ReplayCraft2D(player) { //if SharedVariables.replayStateMachine.state = recSaved
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.preview.replay") //0
        .button("dbg.rc1.button.stop.preview") //1
        .button("dbg.rc1.button.preview.settings") //2
        .button("dbg.rc1.button.start.camera.setup") //3
        .button("dbg.rc1.button.cancel.recording") //4
        .body("dbg.rc1.body.2d");
    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => doViewReplay(player),
            1: () => doStopPreview(player),
            2: () => previewSettings(player),
            3: () => doCamSetup(player),
            4: () => cancelRec(player),
        };
        const selectedAction = actions[result.selection];
        if (selectedAction) {
            selectedAction();
        }
    });
}

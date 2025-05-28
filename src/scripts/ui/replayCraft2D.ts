
import * as ui from "@minecraft/server-ui";
import { previewSettings } from "./settings/previewSettings";

import { cancelRec } from "./cancelRec";
import { Player } from "@minecraft/server";
import { doViewReplay } from "../functions/replayControls/doViewReplay";
import { doStopPreview } from "../functions/replayControls/doStopPreview";
import { doCamSetup } from "../functions/camera/doCamSetup";
import { loadBuildName } from "./load-buildname";
export function ReplayCraft2D(player: Player) { //if SharedVariables.replayStateMachine.state = recSaved
    const replayForm = new ui.ActionFormData()
        .title("replaycraft.previewmenu.title")
        .button("dbg.rc1.button.preview.replay") //0
        .button("dbg.rc1.button.stop.preview") //1
        .button("dbg.rc1.button.preview.settings") //2
        .button("dbg.rc1.button.start.camera.setup") //3
        .button("dbg.rc1.button.cancel.recording") //4
        .button("dbg.rc1.button.load.session") //5
        .body("dbg.rc1.body.2d");
    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => doViewReplay(player),
            1: () => doStopPreview(player),
            2: () => previewSettings(player),
            3: () => doCamSetup(player),
            4: () => cancelRec(player),
            5: () => loadBuildName(player),
            
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

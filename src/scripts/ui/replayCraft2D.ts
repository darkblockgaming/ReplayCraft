
import * as ui from "@minecraft/server-ui";
import { previewSettings } from "./settings/previewSettings";

import { cancelRec } from "./cancelRec";
import { Player } from "@minecraft/server";
import { doViewReplay } from "../functions/replayControls/doViewReplay";
import { doStopPreview } from "../functions/replayControls/doStopPreview";
import { doCamSetup } from "../functions/camera/doCamSetup";
import { loadBuildName } from "./load-buildname";
import { setSkin } from "./settings/setSkin";
export function ReplayCraft2D(player: Player) { //if SharedVariables.replayStateMachine.state = recSaved
    const replayForm = new ui.ActionFormData()
        .title("replaycraft.previewmenu.title")
        .button("dbg.rc1.button.preview.replay") //0
        .button("dbg.rc1.button.stop.preview") //1
        .button("dbg.rc1.button.preview.settings") //2
        .button("replaycarft.setskin.button") //3
        .button("dbg.rc1.button.start.camera.setup") //4
        .button("dbg.rc1.button.cancel.recording") //5
        .button("dbg.rc1.button.load.session") //6
        .body("dbg.rc1.body.2d");
    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => doViewReplay(player),
            1: () => doStopPreview(player),
            2: () => previewSettings(player),
            3: () => setSkin(player),
            4: () => doCamSetup(player),
            5: () => cancelRec(player),
            6: () => loadBuildName(player),
            
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

import * as ui from "@minecraft/server-ui";
import { previewSettings } from "./settings/preview-settings";

import { cancelRec } from "./cancel-recording";
import { Player } from "@minecraft/server";
import { doViewReplay } from "../functions/replayControls/start-replay-preview-playback";
import { doStopPreview } from "../functions/replayControls/stop-replay-preview-playback";
import { doCamSetup } from "../functions/camera/start-camera-setup";
import { loadBuildName } from "./load-buildname";
import { setSkin } from "./settings/set-skin";
export function ReplayCraft2D(player: Player) {
    //if SharedVariables.replayStateMachine.state = recSaved
    const replayForm = new ui.ActionFormData()
        .title("rc1.previewmenu.title")
        .button("rc1.button.preview.replay") //0
        .button("rc1.button.stop.preview") //1
        .button("replaycarft.setskin.button") //2
        .button("rc1.button.preview.settings") //3
        .button("rc1.button.start.camera.setup") //4
        .button("rc1.button.cancel.recording") //5
        .button("rc1.button.load.session") //6
        .body("rc1.body.2d");
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => doViewReplay(player),
            1: () => doStopPreview(player),
            2: () => setSkin(player),
            3: () => previewSettings(player),
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

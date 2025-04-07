
import * as ui from "@minecraft/server-ui";
import { loadFrameTicksForm } from "./loadFrameTicksForm";
import { loadFrameSecondsForm } from "./loadFrameSecondsForm";
import { cancelRec } from "./cancelRec";
import { Player } from "@minecraft/server";
import { addPos } from "../functions/camera/addPos";
import { doProceedFurther } from "../functions/camera/doProceedFurther";
import { resetCamSetup } from "../functions/camera/resetCamSetup";
import { respawnCameraEntities } from "../functions/camera/camera-load-from-database";
import { saveToDB } from "../functions/replayControls/save-to-database";
export function ReplayCraft2E(player: Player) { //if SharedVariables.replayStateMachine.state = recCamSetup
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.load.frame.t") //0
        .button("dbg.rc1.button.load.frame.s") //1
        .button("dbg.rc1.button.add.camera.point") //2
        .button("dbg.rc1.button.proceed.further") //3
        .button("dbg.rc1.button.reset.camera.setup") //4
        .button("dbg.rc1.button.cancel.recording") //5
        .button("Load existing camera points") //6
        .button("Save current camera points") //7
        .body("dbg.rc1.body.2e");
    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => loadFrameTicksForm(player),
            1: () => loadFrameSecondsForm(player),
            2: () => addPos(player),
            3: () => doProceedFurther(player),
            4: () => resetCamSetup(player),
            5: () => cancelRec(player),
            6: () => respawnCameraEntities(player),
            7: () => saveToDB(player),

        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}
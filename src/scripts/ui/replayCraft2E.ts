import * as ui from "@minecraft/server-ui";
import { Player } from "@minecraft/server";

export function ReplayCraft2E(player: Player) { //if replayStateMachine.state = recCamSetup
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.load.frame.t") //0
        .button("dbg.rc1.button.load.frame.s") //1
        .button("dbg.rc1.button.add.camera.point") //2
        .button("dbg.rc1.button.proceed.further") //3
        .button("dbg.rc1.button.reset.camera.setup") //4
        .button("dbg.rc1.button.cancel.recording") //5
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
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}
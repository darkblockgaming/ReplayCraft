import * as ui from "@minecraft/server-ui";
import { cancelRec } from "./cancelRec";
import { replaySettings } from "./settings/replaySettings";
import { Player } from "@minecraft/server";
import { doReplay } from "../functions/replayControls/doReplay";
import { doStopReplay } from "../functions/replayControls/doStopReplay";
import { doCamSetupGoBack } from "../functions/camera/doCamSetupGoBack";
import { loadBuildName } from "./load-buildname";
import { setSkin } from "./settings/setSkin";
export function ReplayCraft2F(player: Player) {
    //if SharedVariables.replayStateMachine.state = recSaved
    const replayForm = new ui.ActionFormData()
        .title("replaycraft.replaymenu.title")
        .button("dbg.rc1.button.start.replay") //0
        .button("dbg.rc1.button.stop.replay") //1
        .button("dbg.rc1.button.settings") //2
        .button("replaycarft.setskin.button") //3
        .button("dbg.rc1.button.goback.camsetup") //4
        .button("dbg.rc1.button.load.structure.or.reset") //5
        .button("dbg.rc1.button.load.session") //6
        .body("replaycraft.finalize.record.body");
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => doReplay(player),
            1: () => doStopReplay(player),
            2: () => replaySettings(player),
            3: () => setSkin(player),
            4: () => doCamSetupGoBack(player),
            5: () => cancelRec(player),
            6: () => loadBuildName(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

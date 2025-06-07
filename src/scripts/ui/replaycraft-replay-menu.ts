import * as ui from "@minecraft/server-ui";
import { cancelRec } from "./cancel-recording";
import { replaySettings } from "./settings/replay-settings";
import { Player } from "@minecraft/server";
import { doReplay } from "../functions/replayControls/start-replay-playback";
import { doStopReplay } from "../functions/replayControls/stop-replay-playback";
import { doCamSetupGoBack } from "../functions/camera/return-camera-setup";
import { loadBuildName } from "./load-buildname";
export function ReplayCraft2F(player: Player) {
    //if SharedVariables.replayStateMachine.state = recSaved
    const replayForm = new ui.ActionFormData()
        .title("replaycraft.replaymenu.title")
        .button("dbg.rc1.button.start.replay") //0
        .button("dbg.rc1.button.stop.replay") //1
        .button("dbg.rc1.button.settings") //2
        .button("dbg.rc1.button.goback.camsetup") //3
        .button("dbg.rc1.button.load.structure.or.reset") //4
        .button("dbg.rc1.button.load.session") //5
        .body("replaycraft.finalize.record.body");
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => doReplay(player),
            1: () => doStopReplay(player),
            2: () => replaySettings(player),
            3: () => doCamSetupGoBack(player),
            4: () => cancelRec(player),
            5: () => loadBuildName(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

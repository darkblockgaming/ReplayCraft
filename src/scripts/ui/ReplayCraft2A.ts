
import * as ui from "@minecraft/server-ui";
import { mainSettings } from "./settings/mainsettings";
import { multiPlayersett } from "./settings/multiplayer";
import { doStart } from "../replayControls/doStart";
import { rcInfo } from "../../guideabout";
import { Player } from "@minecraft/server";
export function ReplayCraft2A(player: Player) { //Default
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.start.recording") //0
        .button("dbg.rc1.button.settings") //1
        .button("dbg.rc1.button.multiplayer.settings")
        .button("dbg.rc1.button.important.info") //3
        .body("dbg.rc1.body.2a");

    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => doStart(player),
            1: () => mainSettings(player),
            2: () => multiPlayersett(player),
            3: () => rcInfo(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

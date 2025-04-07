
import * as ui from "@minecraft/server-ui";
import { mainSettings } from "./settings/mainsettings";
import { multiPlayersett } from "./settings/multiplayer";
import { Player } from "@minecraft/server";
import { rcInfo } from "./guideabout";
import { setBuildName } from "./set-buildname";
import { loadBuildName } from "./load-buildname";
export function ReplayCraft2A(player: Player) { //Default
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu") 
        .button("dbg.rc1.button.start.recording") //0
        .button("dbg.rc1.button.load.session") //1
        .button("dbg.rc1.button.settings") //2
        .button("dbg.rc1.button.multiplayer.settings")//3
        .button("dbg.rc1.button.important.info") //4
        .body("dbg.rc1.body.2a");

    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => setBuildName(player),
            1: () => loadBuildName(player),
            2: () => mainSettings(player),
            3: () => multiPlayersett(player),
            4: () => rcInfo(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

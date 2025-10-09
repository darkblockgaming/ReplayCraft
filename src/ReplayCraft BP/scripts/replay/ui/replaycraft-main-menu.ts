import * as ui from "@minecraft/server-ui";
import { mainSettings } from "./settings/main-settings";
import { Player } from "@minecraft/server";
import { setBuildName } from "./set-buildname";
import { loadBuildName } from "./load-buildname";
import { deleteBuildUI } from "./remove-session-from-database";

//was ReplayCraft2A
export function uiReplayCraftMainMenu(player: Player) {
    //Default
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.start.recording") //0
        .button("dbg.rc1.button.load.session") //1
        .button("dbg.rc1.button.delete.session") //2
        .button("dbg.rc1.button.settings") //3
        .body("dbg.rc1.body.2a");

    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => setBuildName(player),
            1: () => loadBuildName(player),
            2: () => deleteBuildUI(player),
            3: () => mainSettings(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

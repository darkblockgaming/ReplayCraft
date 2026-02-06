import * as ui from "@minecraft/server-ui";
import { mainSettings } from "./settings/main-settings";
import { Player } from "@minecraft/server";
import { setBuildName } from "./set-buildname";
import { loadBuildName } from "./load-buildname";
import { deleteBuildUI } from "./remove-session-from-database";
import { selectBuildFromExternalServer } from "./load-build-external";

//was ReplayCraft2A
export function uiReplayCraftMainMenu(player: Player) {
    //Default
    const replayForm = new ui.ActionFormData()
        .title("rc1.title.replay.menu")
        .button("rc1.button.start.recording") //0
        .button("rc1.button.load.session") //1
        .button("Load From External") //2
        .button("rc1.button.delete.session") //3
        .button("rc1.button.settings") //4
        .body("rc1.body.2a");

    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => setBuildName(player),
            1: () => loadBuildName(player),
            2: () => selectBuildFromExternalServer(player),
            3: () => deleteBuildUI(player),
            4: () => mainSettings(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

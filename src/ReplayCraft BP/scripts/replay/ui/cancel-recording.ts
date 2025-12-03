import * as ui from "@minecraft/server-ui";

import { Player } from "@minecraft/server";
import { doSaveReset } from "../functions/replayControls/load-progress-and-reset";
import { deletePro } from "../functions/replayControls/delete-progress";

export function cancelRec(player: Player) {
    const replayForm = new ui.ActionFormData()
        .title("rc1.title.replay.menu")
        .button("rc1.button.load.build.and.Reset") //0
        .button("rc1.button.delete.progress") //1
        .body("rc1.body.made.by.dbg");
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => doSaveReset(player),
            1: () => deletePro(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

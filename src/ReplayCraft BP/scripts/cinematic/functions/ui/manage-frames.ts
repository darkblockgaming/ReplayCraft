import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
//Import functions
import { removeLastFrame } from "../remove-last-frame";
import { removeAllFrames } from "../remove-all-frames";
import { cineRuntimeDataMap } from "../../data/maps";
import { framePlacementMenu } from "./frame-placement";

export function frameManagementMenu(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    cineRuntimeData.state = "frameManagementMenu";
    const replayForm = new ActionFormData()
        .title("dbg.rc2.title.cinematic.menu")
        .body("dbg.rc2.body.manage.frames")
        .button("dbg.rc2.button.remove.last.frame")
        .button("dbg.rc2.button.remove.all.frames")
        .button("dbg.rc2.button.go.back");
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => removeLastFrame(player),
            1: () => removeAllFrames(player),
            2: () => framePlacementMenu(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

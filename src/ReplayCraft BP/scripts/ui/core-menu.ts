import * as ui from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { ReplayCraft } from "../ReplayCraft";
export function ReplayCraft2A(player: Player) {
    //Default
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("Open ReplayCraft") //0
        .button("Open Cinematic "); //1
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => ReplayCraft2A(player),
            1: () => ReplayCraft(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

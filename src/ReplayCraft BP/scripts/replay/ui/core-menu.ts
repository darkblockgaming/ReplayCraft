import * as ui from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
//import { cinematicUi } from "../../cinematic/functions/ui/frame-placement";
import { uiReplayCraftMainMenu } from "./replaycraft-main-menu";
export function uiReplayCraftCore(player: Player) {
    //Default
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("Open ReplayCraft") //0
        .button("Open Cinematic "); //1
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => uiReplayCraftMainMenu(player),
            //1: () => cinematicUi(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

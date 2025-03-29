import * as ui from "@minecraft/server-ui";
import { Player } from "@minecraft/server";

export function ReplayCraft2A(player: Player) { //Default
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.start.recording") //0
        .button("dbg.rc1.button.settings") //1
        //.button("What To Do?") //
        //.button("Key Features") //2
        .button("dbg.rc1.button.multiplayer.settings")
        .button("dbg.rc1.button.important.info") //3
        .body("dbg.rc1.body.2a");

    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => doStart(player),
            1: () => mainSettings(player),
            //2: () => whatToDo(player),
            2: () => multiplayerSett(player),
            3: () => rcInfo(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}
import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
//Import functions
import { addCameraFrame } from "../add-frame";
import { startPreview } from "../camera/start-prev-camera";
import { removeLastFrame } from "../remove-last-frame";
import { removeAllFrames } from "../remove-all-frames";
import { frameSettings } from "./settings/frame-settings";
import { uiStateMap } from "../../data/maps";
import { cameraPlaybackMenu } from "./camera-playback-menu";
// import { startCamera } from "../camera/start-camera";
// import { stopCamera } from "../camera/stop-camera";

export function framePlacementMenu(player: Player) {
    const uiState = uiStateMap.get(player.id);
    uiState.state = "framePlacementMenu";
    const replayForm = new ActionFormData()
        .title("dbg.rc2.title.cinematic.menu")
        .body("dbg.rc2.body.create.path")
        .button("dbg.rc2.button.add.position.frame")
        .button("dbg.rc2.button.preview")
        .button("dbg.rc2.button.remove.last.frame")
        .button("dbg.rc2.button.remove.all.frames")
        .button("dbg.rc2.button.frame.settings")
        .button("dbg.rc2.button.next");
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => addCameraFrame(player),
            1: () => startPreview(player),
            2: () => removeLastFrame(player),
            3: () => removeAllFrames(player),
            4: () => frameSettings(player),
            5: () => cameraPlaybackMenu(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

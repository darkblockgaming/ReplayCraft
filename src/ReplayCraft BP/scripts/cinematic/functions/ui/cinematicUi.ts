import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
//Import functions
import { addCameraFrame } from "../addFrame";
import { removeLastFrame } from "../removeLastFrame";
import { removeAllFrames } from "../removeAllFrames";
import { cineSettings } from "../settings";
import { cineResetSettings } from "../resetSettings";
import { startCamera } from "../camera/startCamera";
import { startPreview } from "../camera/startPrevCamera";
import { stopCamera } from "../camera/stopCamera";

export function cinematicUi(player: Player) {
    const replayForm = new ActionFormData()
        .title("dbg.rc2.title.cinematic.menu")
        .button("dbg.rc2.button.add.position.frame")
        .button("dbg.rc2.button.start.camera")
        .button("dbg.rc2.button.preview")
        .button("dbg.rc2.button.stop.camera")
        .button("dbg.rc2.button.settings")
        .button("dbg.rc2.button.reset.settings")
        .button("dbg.rc2.button.remove.last.frame")
        .button("dbg.rc2.button.remove.all.frames")
        .body("dbg.rc2.body");
    replayForm.show(player).then((result: any) => {
        if (result.canceled) return;
        const actions = {
            0: () => addCameraFrame(player),
            1: () => startCamera(player),
            2: () => startPreview(player),
            3: () => stopCamera(player),
            4: () => cineSettings(player),
            5: () => cineResetSettings(player),
            6: () => removeLastFrame(player),
            7: () => removeAllFrames(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

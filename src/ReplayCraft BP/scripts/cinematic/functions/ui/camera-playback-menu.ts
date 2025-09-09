import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { cineRuntimeDataMap } from "../../data/maps";
import { cameraSettings } from "./settings/camera-settings";
import { cineResetSettings } from "./settings/reset-settings";
import { startCamera } from "../camera/start-camera";
import { stopCamera } from "../camera/stop-camera";
import { framePlacementMenu } from "./frame-placement";

export function cameraPlaybackMenu(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    cineRuntimeData.state = "cameraPlaybackMenu";
    const replayForm = new ActionFormData()
        .title("dbg.rc2.title.cinematic.menu")
        .body("dbg.rc2.body.camera-playback")
        .button("dbg.rc2.button.start.camera")
        .button("dbg.rc2.button.stop.camera")
        .button("dbg.rc2.button.camera.settings")
        .button("dbg.rc2.button.reset.camera.settings")
        .button("dbg.rc2.button.go.back");
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => startCamera(player),
            1: () => stopCamera(player),
            2: () => cameraSettings(player),
            3: () => cineResetSettings(player),
            4: () => framePlacementMenu(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

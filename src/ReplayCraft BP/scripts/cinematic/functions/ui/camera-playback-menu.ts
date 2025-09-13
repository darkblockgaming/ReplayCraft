import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { cineRuntimeDataMap } from "../../data/maps";
import { cameraSettings } from "./settings/camera-settings";
import { cineResetSettings } from "./settings/reset-settings";
import { startCamera } from "../camera/start-camera";
import { stopCamera } from "../camera/stop-camera";
import { framePlacementMenu } from "./frame-placement";
import { notifyPlayer } from "../helpers/notify-player";

export function cameraPlaybackMenu(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    cineRuntimeData.state = "cameraPlaybackMenu";
    const isCameraInMotion = cineRuntimeData.isCameraInMotion;

    const replayForm = new ActionFormData().title("rc2.title.cinematic.menu").body("rc2.body.camera-playback");

    // Conditional button: Start or Stop
    if (isCameraInMotion) {
        replayForm.button("rc2.button.stop.camera");
    } else {
        replayForm.button("rc2.button.start.camera");
    }

    replayForm.button("rc2.button.camera.settings").button("rc2.button.reset.camera.settings").button("rc2.button.go.back");

    replayForm.show(player).then((result) => {
        if (result.canceled) return;

        let index = 0;
        const actions: { [key: number]: () => void } = {};

        if (isCameraInMotion) {
            actions[index++] = () => stopCamera(player);
        } else {
            actions[index++] = () => startCamera(player);
        }

        actions[index++] = () => cameraSettings(player);
        actions[index++] = () => cineResetSettings(player);
        actions[index++] = () => {
            if (cineRuntimeData?.isCameraInMotion) {
                notifyPlayer(player, "rc2.mes.cannot.go.back.while.camera.is.in.motion", "note.bass");
                return;
            }
            framePlacementMenu(player);
        };

        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) selectedAction();
    });
}

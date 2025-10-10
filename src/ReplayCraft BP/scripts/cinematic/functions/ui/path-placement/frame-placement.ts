import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
//Import functions
import { addCameraFrame } from "../../add-frame";
import { startPreview } from "../../camera/start-prev-camera";
import { frameSettings } from "../settings/frame-settings";
import { cineRuntimeDataMap, frameDataMap } from "../../../data/maps";
import { cameraPlaybackMenu } from "./camera-playback-menu";
import { stopCamera } from "../../camera/stop-camera";
import { frameManagementMenu } from "./manage-frames";
import { cineMainMenu } from "../cine-main-menu";
import { clearOtherFrameEntities } from "../../entity/clear-other-frame-entities";
import { notifyPlayer } from "../../helpers/notify-player";

export function framePlacementMenu(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    cineRuntimeData.state = "framePlacementMenu";
    const isCameraInMotion = cineRuntimeData.isCameraInMotion;

    const replayForm = new ActionFormData().title("rc2.title.cinematic.menu").body("rc2.body.create.path").button("rc2.button.add.position.frame");

    // Only add one button depending on motion state
    if (isCameraInMotion) {
        replayForm.button("rc2.button.stop.preview"); // stop
    } else {
        replayForm.button("rc2.button.preview"); // start
    }

    replayForm.button("rc2.button.manage.frames").button("rc2.button.frame.settings").button("rc2.button.next").button("rc2.button.go.back");

    replayForm.show(player).then((result) => {
        if (result.canceled) return;

        let index = 0;
        const actions: { [key: number]: () => void } = {};

        actions[index++] = () => addCameraFrame(player, "path_placement");

        if (isCameraInMotion) {
            actions[index++] = () => stopCamera(player, "path_placement");
        } else {
            actions[index++] = () => startPreview(player);
        }

        actions[index++] = () => frameManagementMenu(player);
        actions[index++] = () => frameSettings(player);
        actions[index++] = () => {
            if (isCameraInMotion) {
                player.playSound("note.bass");
                player.sendMessage({ translate: "rc2.mes.camera.is.already.moving" });
                return;
            }
            const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];
            if (frames.length === 0) {
                player.playSound("note.bass");
                player.sendMessage({ translate: "rc2.mes.no.frames.found" });
                return;
            }

            if (frames.length === 1) {
                player.playSound("note.bass");
                player.sendMessage({ translate: "rc2.mes.add.more.frames" });
                return;
            }
            cameraPlaybackMenu(player);
        };
        actions[index++] = () => {
            if (cineRuntimeData?.isCameraInMotion) {
                notifyPlayer(player, "rc2.mes.cannot.go.back.while.camera.is.in.motion", "note.bass");
                return;
            }
            //cineRuntimeDataMap.delete(player.id);
            clearOtherFrameEntities(player);
            cineMainMenu(player);
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) selectedAction();
    });
}

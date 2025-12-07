import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
//Import functions
import { addCameraFrame } from "../../add-frame";

import { cineRuntimeDataMap, frameDataMap } from "../../../data/maps";

import { cineMainMenu } from "../cine-main-menu";
import { clearOtherFrameEntities } from "../../entity/clear-other-frame-entities";
import { notifyPlayer } from "../../helpers/notify-player";
import { startPanoramicCamera } from "../../camera/start-pano-camera";
import { panoramaSettings } from "./panorama-settings";
import { stopCamera } from "../../camera/stop-camera";

export function panoramicCinematic(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    cineRuntimeData.state = "panoramicCinematic";

    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];

    const replayForm = new ActionFormData().title("rc2.title.cinematic.menu").body("rc2.body.create.panoramic.cine");

    if (frames.length === 1) {
        replayForm.button({rawtext: [{ text: "§d"}, {translate: "rc2.button.move.anchor.point"}]});
    } else {
        replayForm.button("rc2.button.add.anchor.point");
    }

    if (cineRuntimeData?.isCameraInMotion) {
        replayForm.button({rawtext: [{ text: "§c"}, {translate: "rc2.button.stop.panoramic.cam"}]});
    } else {
        replayForm.button("rc2.button.start.panoramic.cam");
    }

    replayForm
        .button("rc2.button.pano.settings")
        //.button("rc2.button.next")
        .button("rc2.button.go.back");

    replayForm.show(player).then((result) => {
        if (result.canceled) return;

        let index = 0;
        const actions: { [key: number]: () => void } = {};

        actions[index++] = () => addCameraFrame(player, "panoramic"); //add a anchor point instead if camera frames
        actions[index++] = () => {
            if (cineRuntimeData?.isCameraInMotion) {
                stopCamera(player, "panoramic");
            } else {
                if (frames.length === 0) {
                    notifyPlayer(player,"rc2.mes.pano.add.anchor.point", "note.bass");
                    return;
                }
                startPanoramicCamera(player);
            }
        };
        actions[index++] = () => {
            if (frames.length === 0) {
                notifyPlayer(player,"rc2.mes.pano.add.anchor.point", "note.bass");
                return;
            }
            panoramaSettings(player);
        };

        //GO Next
        // actions[index++] = () => {
        //     if (isCameraInMotion) {
        //         player.playSound("note.bass");
        //         player.sendMessage({ translate: "rc2.mes.camera.is.already.moving" });
        //         return;
        //     }
        //     const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];
        //     if (frames.length === 0) {
        //         player.playSound("note.bass");
        //         player.sendMessage({ translate: "rc2.mes.no.frames.found" });
        //         return;
        //     }

        //     if (frames.length === 1) {
        //         player.playSound("note.bass");
        //         player.sendMessage({ translate: "rc2.mes.add.more.frames" });
        //         return;
        //     }
        //     cameraPlaybackMenu(player);
        // };

        //GO Back
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

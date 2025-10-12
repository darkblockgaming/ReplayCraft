import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
//Import functions
import { addCameraFrame } from "../../add-frame";

import { cineRuntimeDataMap, frameDataMap } from "../../../data/maps";

import { cineMainMenu } from "../cine-main-menu";
import { clearOtherFrameEntities } from "../../entity/clear-other-frame-entities";
import { notifyPlayer } from "../../helpers/notify-player";
import { startOrbitalCamera } from "../../camera/start-orbital-camera";
import { stopCamera } from "../../camera/stop-camera";
import { orbitalSettings } from "./orbital-settings";

export function orbitalCinematic(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    cineRuntimeData.state = "orbitalCinematic";

    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];

    const replayForm = new ActionFormData().title("rc2.title.cinematic.menu").body("rc2.body.create.orbital.cine");

    if (frames.length === 1) {
        replayForm.button({rawtext: [{ text: "§d"}, {translate: "rc2.button.move.focus.point"}]});
    } else {
        replayForm.button("rc2.button.add.focus.point");
    }

    if (cineRuntimeData?.isCameraInMotion) {
        replayForm.button({rawtext: [{ text: "§c"}, {translate: "rc2.button.stop.orbital.cam"}]});
    } else {
        replayForm.button("rc2.button.start.orbital.cam");
    }

    replayForm
        .button("rc2.button.orbital.settings")
        //.button("rc2.button.next")
        .button("rc2.button.go.back");

    replayForm.show(player).then((result) => {
        if (result.canceled) return;

        let index = 0;
        const actions: { [key: number]: () => void } = {};

        actions[index++] = () => addCameraFrame(player, "orbital"); //add a anchor point instead if camera frames
        actions[index++] = () => {
            if (cineRuntimeData?.isCameraInMotion) {
                stopCamera(player, "orbital");
            } else {
                if (frames.length === 0) {
                    player.playSound("note.bass");
                    player.sendMessage({ translate: "rc2.mes.pano.add.focus.point" });
                    return;
                }
                startOrbitalCamera(player);
            }
        };
        actions[index++] = () => {
            if (frames.length === 0) {
                player.playSound("note.bass");
                player.sendMessage({ translate: "rc2.mes.pano.add.focus.point" });
                return;
            }
            orbitalSettings(player);
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

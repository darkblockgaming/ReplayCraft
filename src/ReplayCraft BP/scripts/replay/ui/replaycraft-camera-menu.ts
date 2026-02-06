import * as ui from "@minecraft/server-ui";
import { loadFrameTicksForm } from "./load-frame-ticks-form";
import { loadFrameSecondsForm } from "./load-frame-seconds-form";
import { cancelRec } from "./cancel-recording";
import { Player, world } from "@minecraft/server";
import { addCameraPoint } from "../functions/camera/add-camera-point";
import { doProceedFurther } from "../functions/camera/complete-camera-setup";
import { resetCamSetup } from "../functions/camera/reset-camera-setup";
import { respawnCameraEntities } from "../functions/camera/camera-load-from-database";
import { saveToExternalServer } from "../functions/replayControls/save-to-database";
import { openCameraReplaySelectFormTicks } from "./timeline/select-camera-point-ticks";
import { openCameraReplaySelectFormSeconds } from "./timeline/select-camera-point-seconds";
import { replaySessions } from "../data/replay-player-session";
import { enableFlight } from "../functions/player/survival";
import config from "../data/util/config";

// Main menu entry point
export function ReplayCraft2E(player: Player) {
    const form = new ui.ActionFormData()
        .title("rc1.cameramainmenu.title")
        .body("rc1.cameramainmenu.body")
        .button("rc1.timelineplayback.button") // 0
        .button("rc1.recordingcontrols.button") // 1
        .button("rc1.savaload.button"); // 2

    form.show(player).then((result) => {
        if (result.canceled) return;

        switch (result.selection) {
            case 0:
                return showTimelineMenu(player);
            case 1:
                return showRecordingMenu(player);
            case 2:
                return showAdvancedMenu(player);
        }
    });
}

// Submenus:

function showTimelineMenu(player: Player) {
    const form = new ui.ActionFormData()
        .title("rc1.TimelinePlaybackMenu.title")
        .button("rc1.button.load.frame.t") // 0
        .button("rc1.button.load.frame.s") // 1
        .button("rc1.button.add.camera.point") // 2
        .button("rc1.timelineticks.button") // 3
        .button("rc1.timelineseconds.button") // 4
        .button("rc1.ui.back.button"); // 5

    form.show(player).then((result) => {
        if (result.canceled || result.selection === 5) return ReplayCraft2E(player);

        switch (result.selection) {
            case 0:
                return loadFrameTicksForm(player);
            case 1:
                return loadFrameSecondsForm(player);
            case 2:
                // Check if player is in Creative mode
                if (player.getGameMode() !== "Creative") {
                    //Check if the word is in Hardcore mode
                    if (world.isHardcore) {
                        player.sendMessage({
                            //flight cannot be enabled in hardcore mode
                            rawtext: [{ translate: "rc1.hardcore.mode.check" }],
                        });
                        //do the same as ceative mode you will need to get creative with blocks to get the right angle
                        return addCameraPoint(player);
                    }
                    //if the player is not in creative mode, and the world is not in hardcore mode, enable flight
                    return enableFlight(player);
                }
                // If player is in Creative mode, proceed to add camera point
                return addCameraPoint(player);
            case 3:
                return openCameraReplaySelectFormTicks(player);
            case 4:
                return openCameraReplaySelectFormSeconds(player);
        }
    });
}

function showRecordingMenu(player: Player) {
    const form = new ui.ActionFormData()
        .title("rc1.recodingcontrolsmenu.title")
        .button("rc1.button.cancel.recording") // 0
        .button("rc1.button.reset.camera.setup") // 1
        .button("rc1.button.proceed.further") // 2
        .button("rc1.ui.back.button"); // 3

    form.show(player).then((result) => {
        if (result.canceled || result.selection === 3) return ReplayCraft2E(player);

        const actions = [cancelRec, resetCamSetup, doProceedFurther];
        const action = actions[result.selection];
        if (action) action(player);
    });
}

function showAdvancedMenu(player: Player) {
    const form = new ui.ActionFormData()
        .title("rc1.saveloadmenue.title")
        .button("rc1.button.save.current.camera.points") // 0
        .button("rc1.button.load.existing.camera.points") // 1
        .button("rc1.ui.back.button"); // 2

    form.show(player).then((result) => {
        if (result.canceled || result.selection === 2) return ReplayCraft2E(player);

        const actions = [saveToExternalServer, respawnCameraEntities];
        const action = actions[result.selection];
        const session = replaySessions.playerSessions.get(player.id);
        if (!session) {
            player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
            return;
        }
        if (action === saveToExternalServer) {
            action(session, player.id, config.backendURL);
        }
        if (action === respawnCameraEntities) {
            action(player);
        }
    });
}

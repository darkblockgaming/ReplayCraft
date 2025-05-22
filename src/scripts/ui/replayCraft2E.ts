import * as ui from "@minecraft/server-ui";
import { loadFrameTicksForm } from "./loadFrameTicksForm";
import { loadFrameSecondsForm } from "./loadFrameSecondsForm";
import { cancelRec } from "./cancelRec";
import { Player } from "@minecraft/server";
import { addPos } from "../functions/camera/addPos";
import { doProceedFurther } from "../functions/camera/doProceedFurther";
import { resetCamSetup } from "../functions/camera/resetCamSetup";
import { respawnCameraEntities } from "../functions/camera/camera-load-from-database";
import { saveToDB } from "../functions/replayControls/save-to-database";
import { openCameraReplaySelectFormTicks } from "./timeline/select-camera-point-ticks";
import { openCameraReplaySelectFormSeconds } from "./timeline/select-camera-point-seconds";

// Main menu entry point
export function ReplayCraft2E(player: Player) {
    /*
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.load.frame.t") //0
        .button("dbg.rc1.button.load.frame.s") //1
        .button("dbg.rc1.button.add.camera.point") //2
        .button("dbg.rc1.button.proceed.further") //3
        .button("dbg.rc1.button.reset.camera.setup") //4
        .button("dbg.rc1.button.cancel.recording") //5
        .button("dbg.rc1.button.load.existing.camera.points") //6
        .button("dbg.rc1.button.save.current.camera.points") //7
        .button("Replay Timeline (Seconds)") //8
        .button("Replay Timeline (Ticks)") //9
        .body("dbg.rc1.body.2e");
    replayForm.show(player).then(result => {
        if (result.canceled) return;
        const actions = {
            0: () => loadFrameTicksForm(player),
            1: () => loadFrameSecondsForm(player),
            2: () => addPos(player),
            3: () => doProceedFurther(player),
            4: () => resetCamSetup(player),
            5: () => cancelRec(player),
            6: () => respawnCameraEntities(player),
            7: () => saveToDB(player),
            8: () => openCameraReplaySelectFormSeconds(player),
            9: () => openCameraReplaySelectFormTicks(player),
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
    */

    // New, categorized main menu
    const form = new ui.ActionFormData()
        .title("replaycraft.cameramainmenu.title")
        .body("replaycraft.cameramainmenu.body")
        .button("replaycraft.timelineplayback.button", "textures/ui/timeline.png") // 0
        .button("replaycraft.recordingcontrols.button","textures/ui/recording.png")  // 1
        .button("replaycraft.savaload.button","textures/ui/save.png");  // 2

    form.show(player).then(result => {
        if (result.canceled) return;

        switch (result.selection) {
            case 0: return showTimelineMenu(player);
            case 1: return showRecordingMenu(player);
            case 2: return showAdvancedMenu(player);
        }
    });
}

// Submenus:

function showTimelineMenu(player: Player) {
    const form = new ui.ActionFormData()
        .title("replaycraft.TimelinePlaybackMenu.title")
        .button("dbg.rc1.button.load.frame.t", "textures/ui/film-reel.png")     // 0
        .button("dbg.rc1.button.load.frame.s","textures/ui/film-reel.png")   // 1
        .button("dbg.rc1.button.add.camera.point","textures/ui/video-camera.png")       // 2
        .button("replaycraft.timelineticks.button","textures/ui/timeline.png")// 3
        .button("replaycraft.timelineseconds.button","textures/ui/timeline.png") // 4
        .button("replaycraft.ui.back.button","textures/ui/back.png");                  // 5

    form.show(player).then(result => {
        if (result.canceled || result.selection === 5) return ReplayCraft2E(player);

        const actions = [
            loadFrameTicksForm,
            loadFrameSecondsForm,
            addPos,
            openCameraReplaySelectFormTicks,
            openCameraReplaySelectFormSeconds
        ];

        const action = actions[result.selection];
        if (action) action(player);
    });
}

function showRecordingMenu(player: Player) {
    const form = new ui.ActionFormData()
        .title("replaycraft.recodingcontrolsmenu.title")
        .button("dbg.rc1.button.cancel.recording","textures/ui/cancel.png")        // 0
        .button("dbg.rc1.button.reset.camera.setup","textures/ui/restart.png")     // 1
        .button("dbg.rc1.button.proceed.further","textures/ui/go.png")         // 2
       .button("replaycraft.ui.back.button","textures/ui/back.png");                 // 3

    form.show(player).then(result => {
        if (result.canceled || result.selection === 3) return ReplayCraft2E(player);

        const actions = [cancelRec, resetCamSetup, doProceedFurther];
        const action = actions[result.selection];
        if (action) action(player);
    });
}

function showAdvancedMenu(player: Player) {
    const form = new ui.ActionFormData()
        .title("replaycraft.saveloadmenue.title")
        .button("dbg.rc1.button.save.current.camera.points")   // 0
        .button("dbg.rc1.button.load.existing.camera.points")  // 1
        .button("replaycraft.ui.back.button","textures/ui/back.png");                      // 2

    form.show(player).then(result => {
        if (result.canceled || result.selection === 2) return ReplayCraft2E(player);

        const actions = [saveToDB, respawnCameraEntities];
        const action = actions[result.selection];
        if (action) action(player);
    });
}

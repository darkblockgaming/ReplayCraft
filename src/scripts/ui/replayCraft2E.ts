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
import { replaySessions } from "../data/replay-player-session";

// Main menu entry point
export function ReplayCraft2E(player: Player) {
    const form = new ui.ActionFormData()
        .title("replaycraft.cameramainmenu.title")
        .body("replaycraft.cameramainmenu.body")
        .button("replaycraft.timelineplayback.button") // 0
        .button("replaycraft.recordingcontrols.button") // 1
        .button("replaycraft.savaload.button"); // 2

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
        .title("replaycraft.TimelinePlaybackMenu.title")
        .button("dbg.rc1.button.load.frame.t") // 0
        .button("dbg.rc1.button.load.frame.s") // 1
        .button("dbg.rc1.button.add.camera.point") // 2
        .button("replaycraft.timelineticks.button") // 3
        .button("replaycraft.timelineseconds.button") // 4
        .button("replaycraft.ui.back.button"); // 5

    form.show(player).then((result) => {
        if (result.canceled || result.selection === 5) return ReplayCraft2E(player);

        const actions = [loadFrameTicksForm, loadFrameSecondsForm, addPos, openCameraReplaySelectFormTicks, openCameraReplaySelectFormSeconds];

        const action = actions[result.selection];
        if (action) action(player);
    });
}

function showRecordingMenu(player: Player) {
    const form = new ui.ActionFormData()
        .title("replaycraft.recodingcontrolsmenu.title")
        .button("dbg.rc1.button.cancel.recording") // 0
        .button("dbg.rc1.button.reset.camera.setup") // 1
        .button("dbg.rc1.button.proceed.further") // 2
        .button("replaycraft.ui.back.button"); // 3

    form.show(player).then((result) => {
        if (result.canceled || result.selection === 3) return ReplayCraft2E(player);

        const actions = [cancelRec, resetCamSetup, doProceedFurther];
        const action = actions[result.selection];
        if (action) action(player);
    });
}

function showAdvancedMenu(player: Player) {
    const form = new ui.ActionFormData()
        .title("replaycraft.saveloadmenue.title")
        .button("dbg.rc1.button.save.current.camera.points") // 0
        .button("dbg.rc1.button.load.existing.camera.points") // 1
        .button("replaycraft.ui.back.button"); // 2

    form.show(player).then((result) => {
        if (result.canceled || result.selection === 2) return ReplayCraft2E(player);

        const actions = [saveToDB, respawnCameraEntities];
        const action = actions[result.selection];
        const session = replaySessions.playerSessions.get(player.id);
        if (!session) {
            player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
            return;
        }
        if (action) action(player, session);
    });
}

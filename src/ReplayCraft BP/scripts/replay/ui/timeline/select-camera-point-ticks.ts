import { Player } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { replaySessions } from "../../data/replay-player-session";
import { doReplay } from "../../functions/replayControls/start-replay-playback";
import { clearStructure } from "../../functions/clear-structure";
import { loadEntity } from "../../functions/load-entity";
import { loadBlocksUpToTick } from "../../functions/load-blocks-upto-tick";
import { saveToDB } from "../../functions/replayControls/save-to-database";
import { editCameraPointTick } from "./edit-camera-point-tick";
import { removeCameraPoint } from "./remove-camera-point";
import { removeEntities } from "../../functions/remove-entities";
import { respawnCameraEntities } from "../../functions/camera/camera-load-from-database";

export async function openCameraReplaySelectFormTicks(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    //Clean up camera entities
    removeEntities(player, false);
    //reload the current data
    respawnCameraEntities(player);
    //save the current data
    saveToDB(player, session);
    if (session.replayCamPos.length === 0) {
        player.sendMessage({
            rawtext: [{ translate: "dbg.rc1.mes.no.camera.points" }],
        });
        return;
    }

    const form = new ui.ActionFormData().title("Select Camera Point").body("Choose a camera point (by tick) to load, edit, or remove:").button("§2▶ Start from Beginning (Tick 0)");

    session.replayCamPos.forEach((cam, index) => {
        form.button(`Point ${index + 1} - Tick ${cam.tick}`);
    });

    const response = await form.show(player);
    if (response.canceled) return;

    const buttonIndex = response.selection;
    const pointIndex = buttonIndex - 1;

    let tickToUse = 0;
    if (pointIndex >= 0) {
        tickToUse = session.replayCamPos[pointIndex].tick;
    }

    const manageForm = new ui.ActionFormData()
        .title(pointIndex === -1 ? "Manage Start Point" : `Manage Point ${pointIndex + 1}`)
        .body(`Tick: ${tickToUse}`)
        .button("§a▶ Play from this Point");

    if (pointIndex !== -1) {
        manageForm.button("§e✏ Edit Tick").button("§6✏ Edit Position/Rotation").button("§c✘ Remove Point");
    }

    const manageResponse = await manageForm.show(player);
    if (manageResponse.canceled) return;

    switch (manageResponse.selection) {
        case 0: // Play
            session.targetFrameTick = tickToUse;
            session.currentTick = tickToUse;
            session.showCameraSetupUI = true;
            removeEntities(player, false);
            await startReplay(player, pointIndex);
            return;
        case 1: // Edit Time
            if (pointIndex !== -1) {
                await editCameraPointTick(player, pointIndex);
            }
            return;
        case 2: // Edit Position/Rotation
            if (pointIndex !== -1) {
                session.currentEditingCamIndex = pointIndex;
                const cam = session.replayCamPos[pointIndex];
                player.teleport(cam.position, { rotation: session.replayCamRot[pointIndex].rotation });
                player.sendMessage("§f§4[ReplayCraft]§fYou have been Teleported to camera point. Use the ReplayCraft stick to confirm the new location and rotation.");

                // Set the state so the next item use triggers confirmation
                session.replayStateMachine.setState("editingCameraPos");
            }
            return;
        case 3: // Remove
            if (pointIndex !== -1) {
                removeCameraPoint(player, pointIndex);
            }
            return;
    }
}

async function startReplay(player: Player, pointIndex: number) {
    //Check to make sure the pointIndex is valid as the first button play from the beginning will be -1.
    if (pointIndex === -1) {
        // Default to the first point if no valid index is provided as there will always be at least two points
        pointIndex = 0;
    }
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    session.trackedPlayers.forEach((p) => {
        removeEntities(p, true);
    });

    session.frameLoaded = true;

    await Promise.all(session.trackedPlayers.map((player) => clearStructure(player, session)));

    await Promise.all(
        session.trackedPlayers.map(async (p) => {
            await loadEntity(p);
            await loadBlocksUpToTick(session.targetFrameTick, p);
        })
    );
    doReplay(player, pointIndex);
}

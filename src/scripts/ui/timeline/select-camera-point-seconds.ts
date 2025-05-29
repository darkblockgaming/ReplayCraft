import { Player } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../data/replay-player-session";
import { editCameraPointTick } from "../../ui/timeline/edit-camera-point-tick";
import { removeCameraPoint } from "../../ui/timeline/remove-camera-point";
import { clearStructure } from "../../functions/clearStructure";
import { loadBlocksUpToTick } from "../../functions/loadBlocksUpToTick";
import { loadEntity } from "../../functions/loadEntity";
import { removeEntities } from "../../functions/removeEntities";
import { doReplay } from "../../functions/replayControls/doReplay";
import { saveToDB } from "../../functions/replayControls/save-to-database";
import { respawnCameraEntities } from "../../functions/camera/camera-load-from-database";

export async function openCameraReplaySelectFormSeconds(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
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
    session.showCameraSetupUI = false;

    if (session.replayCamPos.length === 0) {
        player.sendMessage({
            rawtext: [{ translate: "dbg.rc1.mes.no.camera.points" }],
        });
        return;
    }

    const form = new ui.ActionFormData().title("Select Camera Point").body("Choose a camera point (by seconds) to load, edit, or remove:").button("§2▶ Start from Beginning (0s)");

    session.replayCamPos.forEach((cam, index) => {
        const seconds = Math.round(cam.tick / 20);
        form.button(`Point ${index + 1} - ${seconds}s`);
    });

    const response = await form.show(player);
    if (response.canceled) return;

    const buttonIndex = response.selection;
    const pointIndex = buttonIndex - 1;

    let tickToUse = 0;
    if (pointIndex >= 0) {
        tickToUse = session.replayCamPos[pointIndex].tick;
    }
    const seconds = Math.round(tickToUse / 20);

    const manageForm = new ui.ActionFormData()
        .title(pointIndex === -1 ? "Manage Start Point" : `Manage Point ${pointIndex + 1}`)
        .body(`Time: ${seconds}s`)
        .button("§a▶ Play from this Point");

    if (pointIndex !== -1) {
        manageForm.button("§e✏ Edit Time (Seconds)").button("§6✏ Edit Position/Rotation").button("§c✘ Remove Point");
    }

    const manageResponse = await manageForm.show(player);
    if (manageResponse.canceled) return;

    switch (manageResponse.selection) {
        case 0: // Play
            session.wantLoadFrameTick = tickToUse;
            session.lilTick = tickToUse;
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
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    session.multiPlayers.forEach((p) => {
        removeEntities(p, true);
    });

    session.frameLoaded = true;

    await Promise.all(session.multiPlayers.map(clearStructure));

    await Promise.all(
        session.multiPlayers.map(async (p) => {
            await loadEntity(p);
            await loadBlocksUpToTick(session.wantLoadFrameTick, p);
        })
    );
    doReplay(player, pointIndex);
}

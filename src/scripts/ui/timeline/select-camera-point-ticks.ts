import { Player } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../main";
import { doReplay } from "../../functions/replayControls/doReplay";
import { clearStructure } from "../../functions/clearStructure";
import { loadEntity } from "../../functions/loadEntity";
import { loadBlocksUpToTick } from "../../functions/loadBlocksUpToTick";
import { saveToDB } from "../../functions/replayControls/save-to-database";
import { editCameraPointTick } from "./edit-camera-point-tick";
import { removeCameraPoint } from "./remove-camera-point";
import { removeEntities } from "../../functions/removeEntities";
import { respawnCameraEntities } from "../../functions/camera/camera-load-from-database";

export async function openCameraReplaySelectFormTicks(player: Player) {
    //Clean up camera entities 
    removeEntities(player, false); 
    //reload the current data 
    respawnCameraEntities(player);
    //save the current data 
    saveToDB(player);
    if (SharedVariables.replayCamPos.length === 0) {
        player.sendMessage({
            "rawtext": [{ "translate": "dbg.rc1.mes.no.camera.points" }]
        });
        return;
    }

    const form = new ui.ActionFormData()
        .title("Select Camera Point")
        .body("Choose a camera point (by tick) to load, edit, or remove:")
        .button("§2▶ Start from Beginning (Tick 0)");

    SharedVariables.replayCamPos.forEach((cam, index) => {
        form.button(`Point ${index + 1} - Tick ${cam.tick}`);
    });

    const response = await form.show(player);
    if (response.canceled) return;

    const buttonIndex = response.selection;
    const pointIndex = buttonIndex - 1;

    let tickToUse = 0;
    if (pointIndex >= 0) {
        tickToUse = SharedVariables.replayCamPos[pointIndex].tick;
    }

    const manageForm = new ui.ActionFormData()
        .title(pointIndex === -1 ? "Manage Start Point" : `Manage Point ${pointIndex + 1}`)
        .body(`Tick: ${tickToUse}`)
        .button("§a▶ Play from this Point");

    if (pointIndex !== -1) {
        manageForm
            .button("§e✏ Edit Tick")
            .button("§6✏ Edit Position/Rotation")
            .button("§c✘ Remove Point");
    }

    const manageResponse = await manageForm.show(player);
    if (manageResponse.canceled) return;

   switch (manageResponse.selection) {
           case 0: // Play
               SharedVariables.wantLoadFrameTick = tickToUse;
               SharedVariables.lilTick = tickToUse;
               SharedVariables.showCameraSetupUI = true;
               await startReplay(player, pointIndex);
               return;
           case 1: // Edit Time
               if (pointIndex !== -1) {
                   await editCameraPointTick(player, pointIndex);
               }
               return;
           case 2: // Edit Position/Rotation
           if (pointIndex !== -1) {
               SharedVariables.currentEditingCamIndex = pointIndex;
               const cam = SharedVariables.replayCamPos[pointIndex];
               player.teleport(cam.position, { rotation: SharedVariables.replayCamRot[pointIndex].rotation });
               player.sendMessage("§f§4[ReplayCraft]§fYou have been Teleported to camera point. Use the ReplayCraft stick to confirm the new location and rotation.");
               
               // Set the state so the next item use triggers confirmation
               SharedVariables.replayStateMachine.setState("editingCameraPos");
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
    SharedVariables.multiPlayers.forEach((p) => {
        removeEntities(p, true);
    });

    SharedVariables.frameLoaded = true;

    await Promise.all(SharedVariables.multiPlayers.map(clearStructure));

    await Promise.all(SharedVariables.multiPlayers.map(async (p) => {
        await loadEntity(p);
        await loadBlocksUpToTick(SharedVariables.wantLoadFrameTick, p);
    }));
    doReplay(player, pointIndex);
}


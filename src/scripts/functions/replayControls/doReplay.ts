
import { Player } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { isChunkLoaded } from "../isChunkLoaded";
import { summonReplayEntity } from "../summonReplayEntity";
import { waitForChunkLoad } from "../waitForChunkLoad";
import { startReplayCam } from "./startReplayCam";

export async function doReplay(player: Player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.sendMessage({
                "rawtext": [{ "translate": "dbg.rc1.mes.replay.is.already.in.progress" }]
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    SharedVariables.replayStateMachine.setState("recStartRep");
    SharedVariables.currentSwitch = true;
    /**
     * We can hide the following hud elements 
     * PaperDoll = 0
     * Armor = 1
     * ToolTips = 2
     * TouchControls = 3
     * Crosshair = 4
     * Hotbar = 5
     * Health = 6
     * ProgressBar = 7
     * Hunger = 8
     * AirBubbles = 9
     * HorseHealth = 10
     * StatusEffects = 11ItemText = 12
     */
    if(SharedVariables.hideHUD === true){
        player.onScreenDisplay.setHudVisibility(0,[0,1,2,3,4,5,6,7,8,9,10,11,12]);
    }
    

    const posData = SharedVariables.replayPosDataMap.get(player.id);
    if (!posData || !posData.dbgRecPos || posData.dbgRecPos.length === 0) {
        console.warn(`No recorded positions found for player ${player.name}`);
        return;
    }

    const firstRecordedPos = posData.dbgRecPos[0];

    // Ensure chunk is loaded before proceeding
    if (!isChunkLoaded(firstRecordedPos, player)) {
        console.log(`Chunk not loaded for ${player.name}, teleporting...`);

        // Try teleporting to load the chunk
        const success = player.tryTeleport(firstRecordedPos, { checkForBlocks: false });

        if (success) {
            await waitForChunkLoad(firstRecordedPos, player);
        } else {
            console.error(`Failed to teleport ${player.name} to load chunk at ${firstRecordedPos.x}, ${firstRecordedPos.y}, ${firstRecordedPos.z}`);
            return;
        }
    }

    // Once chunk is loaded, proceed with replay
    SharedVariables.dbgCamAffectPlayer.forEach((player) => {
        startReplayCam(player);
    });

    SharedVariables.multiPlayers.forEach((player) => {
        summonReplayEntity(player);
    });
}
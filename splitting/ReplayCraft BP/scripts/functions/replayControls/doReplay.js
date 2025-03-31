
import { SharedVariables } from "../../main";
import { isChunkLoaded } from "../isChunkLoaded";
import { summonReplayEntity } from "../summonReplayEntity";
import { waitForChunkLoad } from "../waitForChunkLoad";
import { startReplayCam } from "./startReplayCam";

export async function doReplay(player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.onScreenDisplay.setActionBar({
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

    const posData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
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
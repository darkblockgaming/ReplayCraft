import { system } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { summonReplayEntity } from "../summonReplayEntity";

export async function doViewReplay(player) {
    if (SharedVariables.currentSwitch === true) {
        if (SharedVariables.textPrompt) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.replay.preview.is.already.on"
                }]
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    SharedVariables.replayStateMachine.setState("viewStartRep");

    for (const player of SharedVariables.multiPlayers) {
        const posData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
        if (!posData || !posData.dbgRecPos) {
            console.error(`Replay position data not found for player ${player.name}`);
            continue;
        }

        const summonPos = posData.dbgRecPos[0];

        // Attempt to load the chunk by teleporting the player near it
        const success = player.tryTeleport(summonPos, { checkForBlocks: false });
        if (success) {
            await new Promise(resolve => system.runTimeout(resolve, 5)); // Wait a few ticks
        }

        // Now summon the entity
        summonReplayEntity(player);
    }

    SharedVariables.currentSwitch = true;
}
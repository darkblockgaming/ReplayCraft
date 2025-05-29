import { Player } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
import { resetCamSetup } from "../camera/resetCamSetup";
import { clearStructure } from "../clearStructure";
import { loadBlocksUpToTick } from "../loadBlocksUpToTick";
import { removeEntities } from "../removeEntities";
import { resetRec } from "./resetRec";

export async function doSaveReset(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    if (session.currentSwitch === true) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [{ translate: "dbg.rc1.mes.please.wait.for.replay.or.preview.to.be.completed" }],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    resetCamSetup(player);
    session.replayStateMachine.setState("default");

    // Wait for `clearStructure()` to finish before proceeding
    await clearStructure(player);

    // Then remove entities
    removeEntities(player, false);

    // Now safely load blocks
    await loadBlocksUpToTick(session.dbgRecTime, player);

    // Final reset
    resetRec(player);
}

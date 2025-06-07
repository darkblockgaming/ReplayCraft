import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { resetCamSetup } from "../camera/reset-camera-setup";
import { clearStructure } from "../clear-structure";
import { loadBlocksUpToTick } from "../load-blocks-upto-tick";
import { removeEntities } from "../remove-entities";
import { resetRec } from "./reset-replay";

export async function doSaveReset(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    if (session.isReplayActive === true) {
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
    await loadBlocksUpToTick(session.recordingEndTick, player);

    // Final reset
    resetRec(player);
}

import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { resetCamSetup } from "../camera/reset-camera-setup";
import { clearStructure } from "../clear-structure";
import { removeEntities } from "../remove-entities";
import { resetRec } from "./reset-replay";

export function deletePro(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);

    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    if (session.isReplayActive === true) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.please.wait.for.replay.or.preview.to.be.completed",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    resetCamSetup(player);
    session.replayStateMachine.setState("default");
    session.trackedPlayers.forEach((player) => {
        removeEntities(player, false);
        clearStructure(player, session);
        resetRec(player);
    });
}

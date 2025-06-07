import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { clearStructure } from "../clear-structure";

export function doStopPreview(player: Player) {
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
                        translate: "dbg.rc1.mes.replay.preview.has.stopped.successfully",
                    },
                ],
            });
        }
        session.replayStateMachine.setState("recSaved");

        session.trackedPlayers.forEach((player) => {
            const entityData = session.replayEntityDataMap.get(player.id);
            entityData?.customEntity.remove();
            clearStructure(player);
        });

        session.currentTick = 0;
        session.isReplayActive = false;
        return;
    } else {
        if (session.textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.replay.preview.is.already.off",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
    }
}

import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { clearStructure } from "../clear-structure";
import { cleanupReplayEntities } from "../../multiplayer/cleanup-replay-entities";
import { removeEntities } from "../remove-entities";

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
                        translate: "rc1.mes.replay.preview.has.stopped.successfully",
                    },
                ],
            });
        }
        session.replayStateMachine.setState("recSaved");

        session.trackedPlayers.forEach((player) => {
            const entityData = session.replayEntityDataMap.get(player.id);
            entityData?.customEntity.remove();
            clearStructure(player, session);
            cleanupReplayEntities(session);
            removeEntities(player, true);
        });

        session.currentTick = 0;
        session.isReplayActive = false;
        return;
    } else {
        if (session.textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [
                    {
                        translate: "rc1.mes.replay.preview.is.already.off",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
    }
}

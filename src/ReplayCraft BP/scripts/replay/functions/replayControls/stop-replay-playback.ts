import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { doStopCamera } from "../camera/stop-camera-setup";
import { clearStructure } from "../clear-structure";
import { cleanupReplayEntities } from "../../multiplayer/cleanup-replay-entities";

export function doStopReplay(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    if (session.isReplayActive === false) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "rc1.mes.replay.is.already.stopped",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    session.replayStateMachine.setState("recCompleted");
    if (session.settingReplayType === 0) {
        session.trackedPlayers.forEach((player) => {
            session.isFollowCamActive = false;
            session.isTopDownFixedCamActive = false;
            session.isTopDownDynamicCamActive = false;

            const entityData = session.replayEntityDataMap.get(player.id);
            entityData?.customEntity.remove();
            clearStructure(player, session);
            cleanupReplayEntities(session);

            player.camera.clear();
            //player.runCommand(`camera @s clear`);
            doStopCamera(player);
        });
    }
    session.currentTick = 0;
    session.isReplayActive = false;

    if (session.textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [
                {
                    translate: "rc1.mes.replay.stopped",
                },
            ],
        });
    }
}

import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";

export function doCamSetup(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage("§c[ReplayCraft] Error: No replay session found for you.");
        return;
    }
    if (session.isReplayActive === true) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "rc1.mes.please.wait.for.replay.prev.to.be.completed",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    session.replayStateMachine.setState("recCamSetup");
    if (session.textPrompt) {
        player.sendMessage({
            rawtext: [
                {
                    translate: "rc1.mes.cam.setup",
                },
            ],
        });
    }
    if (session.soundCue) {
        player.playSound("random.orb");
    }
}

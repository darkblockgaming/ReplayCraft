import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";

export function doCamSetupGoBack(player: Player) {
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
                        translate: "rc1.mes.please.wait.for.replay.to.be.completed",
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
    session.replayCamPos = [];
    session.replayCamRot = [];
    session.targetFrameTick = 0;
    if (session.textPrompt) {
        player.sendMessage({
            rawtext: [
                {
                    translate: "rc1.mes.please.do.the.cinematic.camera.setup",
                },
            ],
        });
    }
}

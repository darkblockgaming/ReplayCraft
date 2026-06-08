import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { doResume } from "../../functions/replayControls/pause-replay-recording";
import { replaySessions } from "../../data/replay-player-session";

export function playerResumeRecordingCmd(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    const session = replaySessions.playerSessions.get(sender.id);
    system.run(() => {
        if (!session) {
            sender.sendMessage("§c[ReplayCraft] Error: No replay session found for you.");
            return;
        }
        if (!session.replayStateMachine.states.recPaused) {
            sender.sendMessage("§c[ReplayCraft] Error: You are not currently paused in a recording.");
            return;
        }
        doResume(sender);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Triggering Resume recording...`,
    };
}

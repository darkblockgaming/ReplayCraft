import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { doPause } from "../../functions/replayControls/pause-replay-playback";
import { replaySessions } from "../../data/replay-player-session";

export function playerPauseRecordingCmd(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    const session = replaySessions.playerSessions.get(sender.id);
    system.run(() => {
        if (!session) {
            sender.sendMessage("§c[ReplayCraft] Error: No replay session found for you.");
            return;
        }
        if (!session.replayStateMachine.states.recPending) {
            sender.sendMessage("§c[ReplayCraft] Error: You are not currently recording.");
            return;
        }
        doPause(sender);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Triggering pause recording...`,
    };
}

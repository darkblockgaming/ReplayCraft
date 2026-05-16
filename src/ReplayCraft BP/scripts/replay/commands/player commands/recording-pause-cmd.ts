import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { doPause } from "../../functions/replayControls/pause-replay-playback";
import { replaySessions } from "../../data/replay-player-session";

export function playerPauseRecordingCmd(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    const session = replaySessions.playerSessions.get(sender.id);
    system.run(() => {
        if (!session) {
            sender.sendMessage({
                rawtext: [{ translate: "rc1.session.error.message" }],
            });
            return;
        }

        if (session.replayStateMachine.state == "recPending") doPause(sender);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Triggering pause recording...`,
    };
}

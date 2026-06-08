import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { doStopPreview } from "../../functions/replayControls/stop-replay-preview-playback";
import { doStopReplay } from "../../functions/replayControls/stop-replay-playback";

export function playerStopPlaybackCmd(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    const session = replaySessions.playerSessions.get(sender.id);
    system.run(() => {
        switch (session?.replayStateMachine.state) {
            case "viewStartRep":
                doStopPreview(sender);
                break;
            case "recStartRep":
                doStopReplay(sender);
                break;
            default:
                sender.sendMessage({
                    rawtext: [{ translate: "rc1.session.error.message" }],
                });
        }
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Playback Stopped`,
    };
}

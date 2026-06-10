import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { doSave } from "../../functions/replayControls/save-replay-recording";

export function playerSaveRecordingCmd(_origin: CustomCommandOrigin) {
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
        if (session.replayStateMachine.state == "recPending") doSave(sender);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Triggering Save recording...`,
    };
}

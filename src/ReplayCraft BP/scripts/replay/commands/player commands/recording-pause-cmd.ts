import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { doPause } from "../../functions/replayControls/pause-replay-playback";

export function playerPauseRecordingCmd(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    system.run(() => {
        doPause(sender);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Triggering pause recording...`,
    };
}

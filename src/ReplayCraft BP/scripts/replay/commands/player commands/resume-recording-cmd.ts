import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { doResume } from "../../functions/replayControls/pause-replay-recording";

export function playerResumeRecordingCmd(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    system.run(() => {
        doResume(sender);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Triggering Resume recording...`,
    };
}

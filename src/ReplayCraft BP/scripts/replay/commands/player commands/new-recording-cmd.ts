import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { newSession } from "../../ui/confirm-new-session";
import { setBuildName } from "../../ui/set-buildname";

export function playerNewRecordingCmd(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    const session = replaySessions.playerSessions.get(sender.id);
    system.run(() => {
        if (!session) {
            //If there is no session, then one has to be created. We preset the sessions confirmation UI.
            newSession(sender);
            return;
        }
        //If there is a session they can enter a build name and it will start the recording.
        if (session.replayStateMachine.state == "default") setBuildName(sender);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Triggering New recording...`,
    };
}

import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";

export function playerDisableEntityTracking(_origin: CustomCommandOrigin, booleanValue: boolean) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    system.run(() => {
        const session = replaySessions.playerSessions.get(sender.id);
        if (session) {
            session.entityTrackingEnabled = booleanValue;
        }
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Entity tracking ${booleanValue ? "disabled" : "enabled"}.`,
    };
}

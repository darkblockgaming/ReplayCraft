import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { replayCraftActiveSessionsDB } from "../../classes/subscriptions/world-initialize";
import { showActiveSessionsUI } from "../../ui/debug/active-sessions";

export function sessionManager(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    system.run(() => {
        const sessionEntries = replayCraftActiveSessionsDB.entries();

        const playerLabels: string[] = [];
        const playerIds: string[] = [];

        for (const [playerId, session] of sessionEntries) {
            // Fallback to the current player’s name if the session is missing a name
            const name = session?.playerName ?? "(unknown)";
            console.warn(`[Debug] session.playerName for ${playerId}: ${name}`);
            playerLabels.push(`${playerId} (${name})`);
            playerIds.push(playerId);
        }

        showActiveSessionsUI(sender, playerLabels, playerIds);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Opening Session Manager.`,
    };
}

import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { saveToExternalServer } from "../../functions/replayControls/save-to-database";
import config from "../../data/util/config";

/**
 * Command: Migrates the current replay session data to the external server. Useful for ensuring all data is saved before using other commands or for manual backups.
 */
export function migrateReplayData(origin: CustomCommandOrigin) {
    const sender = origin.sourceEntity as Player;

    if (!sender) {
        return {
            status: CustomCommandStatus.Failure,
            message: "§cThis command must be run by a player.",
        };
    }

    const session = replaySessions.playerSessions.get(sender.id);
    if (!session) {
        return {
            status: CustomCommandStatus.Failure,
            message: "§c[ReplayCraft] Error: No replay session found for you.",
        };
    }

    // Async load handling
    system.run(() => {
        saveToExternalServer(session, sender.id, config.backendURL).catch((err) => {
            sender.sendMessage(`§c[ReplayCraft] Error migrating replay: ${err}`);
        });
    });

    return {
        status: CustomCommandStatus.Success,
        message: `§7Migrating replay data for player §b${sender.name}§7...`,
    };
}

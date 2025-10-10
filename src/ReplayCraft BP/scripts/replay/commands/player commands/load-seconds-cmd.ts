import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { loadReplaySeconds } from "../../functions/player/load-replay-seconds";

/**
 * Command: /load <seconds>
 * Loads the next X seconds (or reloads current frame if 0) of replay data for the executing player.
 */
export function loadSecondsCmd(origin: CustomCommandOrigin, seconds: number) {
    const sender = origin.sourceEntity as Player;

    if (!sender) {
        return {
            status: CustomCommandStatus.Failure,
            message: "§cThis command must be run by a player.",
        };
    }

    if (isNaN(seconds) || seconds < 0) {
        return {
            status: CustomCommandStatus.Failure,
            message: "§cUsage: /load <seconds> (use 0 to reload current frame)",
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
        loadReplaySeconds(sender, session, seconds).catch((err) => {
            sender.sendMessage(`§c[ReplayCraft] Error loading replay: ${err}`);
        });
    });

    if (seconds === 0) {
        return {
            status: CustomCommandStatus.Success,
            message: "§7Loading from §bstart (tick 0)§7...",
        };
    }

    return {
        status: CustomCommandStatus.Success,
        message: `§7Loading next §b${seconds}§7 seconds...`,
    };
}

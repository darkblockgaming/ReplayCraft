import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { debugWarn } from "../../data/util/debug";

/**
 * Toggles the playback HUD visibility for a player and optionally sets which HUD element to display.
 *
 * @param {CustomCommandOrigin} _origin - The origin of the command, used to get the executing player.
 * @param {number} [hudElement] - Optional HUD element index to display (0 or 1).
 * @returns {{status: CustomCommandStatus, message: string}} - The command result with status and message.
 */
export function updatePlaybackHudCmd(_origin: CustomCommandOrigin, isVisable: boolean, hudElement?: number) {
    const entity = _origin.sourceEntity;
    const player = entity as Player;

    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        debugWarn(`[ReplayCraft] No replay session found for ${player.name} (${player.id})`);
        return {
            status: CustomCommandStatus.Failure,
            message: `No replay session found for ${player.name}.`,
        };
    }

    // Run HUD updates asynchronously to avoid blocking the main thread
    system.run(() => {
        // Toggle HUD visibility
        if (isVisable) {
            session.playbackHUD.isVisible = true;
            player.sendMessage(`[ReplayCraft] Playback HUD enabled.`);
        } else {
            session.playbackHUD.isVisible = false;
            player.sendMessage(`[ReplayCraft] Playback HUD disabled.`);
        }

        // Update HUD element if provided and valid
        if (hudElement === 0 || hudElement === 1) {
            session.playbackHUD.elementToUse = hudElement;
        }
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Updated playback HUD settings.`,
    };
}

import { Player } from "@minecraft/server";
import { PlayerReplaySession } from "../../data/replay-player-session";
import { removeEntities } from "../remove-entities";
import { clearStructure } from "../clear-structure";
import { loadEntity } from "../load-entity";
import { loadBlocksUpToTick } from "../load-blocks-upto-tick";

/**
 * Loads the replay state up to a given timestamp (in seconds).
 * Can move forward or backward in time, with feedback when at bounds.
 * Tick 0 can always be reloaded.
 *
 * @param player - The player executing the load.
 * @param session - The replay session object.
 * @param seconds - The target replay time in seconds (0 = start).
 */
export async function loadReplaySeconds(player: Player, session: PlayerReplaySession, seconds: number) {
    const totalTicks = session.recordingEndTick;
    const totalSeconds = totalTicks / 20;

    // Clamp seconds between 0 and totalSeconds
    const targetSeconds = Math.min(Math.max(0, seconds), totalSeconds);
    const targetTick = Math.round(targetSeconds * 20);

    // Always allow reloading tick 0
    const forceReload = targetSeconds === 0;
    if (targetTick === session.targetFrameTick && !forceReload) {
        player.sendMessage("§e[ReplayCraft] Already at this frame.");
        return;
    }

    const direction = targetTick > session.targetFrameTick ? "forward" : "backward";

    session.targetFrameTick = targetTick;
    session.frameLoaded = true;

    // Feedback messages
    if (targetSeconds === 0) {
        player.sendMessage("§6[ReplayCraft] Loaded start of replay (tick 0).");
    } else if (targetSeconds === totalSeconds) {
        player.sendMessage(`§6[ReplayCraft] Loaded end of replay (tick ${totalTicks}).`);
    } else {
        player.sendMessage(`§4[ReplayCraft]§a Loading §b${direction}§a to §e${targetSeconds.toFixed(2)}s§a (tick §e${targetTick}§a)...`);
    }

    // Clear entities and structures, then reload blocks and entities up to targetTick
    removeEntities(player, true);

    await Promise.all(
        session.trackedPlayers.map(async (p) => {
            await clearStructure(p, session);
        })
    );

    await Promise.all(
        session.trackedPlayers.map(async (p) => {
            await loadEntity(p);
            await loadBlocksUpToTick(targetTick, p);
        })
    );

    player.sendMessage("§4[ReplayCraft]§a Frame loaded successfully.");
}

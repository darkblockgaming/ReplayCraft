import { Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { summonReplayEntity } from "../summon-replay-entity";

export async function doViewReplay(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    if (session.isReplayActive === true) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.replay.preview.is.already.on",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    session.replayStateMachine.setState("viewStartRep");

    for (const player of session.trackedPlayers) {
        const posData = session.replayPositionDataMap.get(player.id);
        if (!posData || !posData.recordedPositions) {
            console.error(`Replay position data not found for player ${player.name}`);
            continue;
        }

        const summonPos = posData.recordedPositions[0];

        // Calculate distance between player and the target position (summonPos)
        const dx = player.location.x - summonPos.x;
        const dz = player.location.z - summonPos.z;
        const distanceSquared = dx * dx + dz * dz;

        // Define chunk radius for comparison
        const CHUNK_RADIUS = 4 * 16; // 4 chunks * 16 blocks per chunk = 64 blocks
        const isFarAway = distanceSquared > CHUNK_RADIUS * CHUNK_RADIUS; // Player is outside the 4-chunk radius

        if (isFarAway) {
            const success = player.tryTeleport(summonPos, { checkForBlocks: false });
            if (success) {
                // Wait for the chunk to load before continuing
                await new Promise<void>((resolve) => system.runTimeout(() => resolve(), 5)); // Wait a few ticks
            } else {
                console.error(`Teleport failed to load chunk at ${summonPos.x}, ${summonPos.y}, ${summonPos.z}`);
            }
        }

        // Now summon the entity after ensuring the chunk is loaded
        summonReplayEntity(player);
    }

    session.isReplayActive = true;
    /**
     * We can hide the following hud elements
     * PaperDoll = 0
     * Armor = 1
     * ToolTips = 2
     * TouchControls = 3
     * Crosshair = 4
     * Hotbar = 5
     * Health = 6
     * ProgressBar = 7
     * Hunger = 8
     * AirBubbles = 9
     * HorseHealth = 10
     * StatusEffects = 11ItemText = 12
     */
    if (session.hideHUD === true) {
        player.onScreenDisplay.setHudVisibility(0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }
}

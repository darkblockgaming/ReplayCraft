import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { isChunkLoaded } from "../isChunkLoaded";
import { summonReplayEntity } from "../summonReplayEntity";
import { waitForChunkLoad } from "../waitForChunkLoad";
import { startReplayCam } from "./startReplayCam";
import { removeEntities } from "../removeEntities";

export async function doReplay(player: Player, pointIndex?: number) {
    const session = replaySessions.playerSessions.get(player.id);

    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    if (session.isReplayActive === true) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [{ translate: "dbg.rc1.mes.replay.is.already.in.progress" }],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    session.replayStateMachine.setState("recStartRep");
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

    // Hide HUD if needed
    if (session.hideHUD === true) {
        player.onScreenDisplay.setHudVisibility(0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }

    const posData = session.replayPositionDataMap.get(player.id);
    if (!posData || !posData.recordedPositions || posData.recordedPositions.length === 0) {
        console.warn(`No recorded positions found for player ${player.name}`);
        return;
    }

    const startTick = session.targetFrameTick;
    const totalTicks = Math.min(posData.recordedPositions.length, session.recordingEndTick);
    const clampedTick = Math.min(Math.max(startTick, 0), totalTicks - 1);
    const closestFrame = posData.recordedPositions[clampedTick];

    const firstRecordedPos = closestFrame;
    removeEntities(player, true); // Remove any existing entities before proceeding

    // Ensure chunk is loaded before proceeding
    if (!isChunkLoaded(firstRecordedPos, player)) {
        console.log(`Chunk not loaded for ${player.name}, teleporting...`);

        const success = player.tryTeleport(firstRecordedPos, { checkForBlocks: false });

        if (success) {
            await waitForChunkLoad(firstRecordedPos, player);
        } else {
            console.error(`Failed to teleport ${player.name} to load chunk at ${firstRecordedPos.x}, ${firstRecordedPos.y}, ${firstRecordedPos.z}`);
            return;
        }
    }

    // Proceed with replay: Start the camera and summon replay entities
    session.cameraAffectedPlayers.forEach((player) => {
        startReplayCam(player, pointIndex); // Ensure camera starts from correct tick
    });

    session.trackedPlayers.forEach((player) => {
        summonReplayEntity(player); // Ensure entities spawn from correct tick
    });
}

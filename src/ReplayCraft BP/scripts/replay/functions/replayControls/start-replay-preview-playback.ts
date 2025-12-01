import { Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { summonReplayEntity } from "../summon-replay-entity";
import { debugError } from "../../data/util/debug";

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
    player.sendMessage(`[ReplayCraft] Tracked players count: ${session.trackedPlayers.length}`);
    const controller = session.replayController;
    if (!controller) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay controller player found.`);
        return;
    }

    const posData = session.replayPositionDataMap.get(controller.id);
    if (!posData || !posData.recordedPositions) {
        debugError(`Replay position data not found for controller player ${controller.name}`);
        return;
    }

    const summonPos = posData.recordedPositions[0];

    // Teleport player if too far away to ensure chunk load
    const dx = player.location.x - summonPos.x;
    const dz = player.location.z - summonPos.z;
    const distanceSquared = dx * dx + dz * dz;
    const CHUNK_RADIUS = 4 * 16;
    const isFarAway = distanceSquared > CHUNK_RADIUS * CHUNK_RADIUS;

    if (isFarAway) {
        const success = player.tryTeleport(summonPos, { checkForBlocks: false });
        if (success) {
            await new Promise<void>((resolve) => system.runTimeout(() => resolve(), 5));
        } else {
            debugError(`Teleport failed to load chunk at ${summonPos.x}, ${summonPos.y}, ${summonPos.z}`);
        }
    }

    // Summon only the controller entity at start of replay
    summonReplayEntity(session, controller, player.id);

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

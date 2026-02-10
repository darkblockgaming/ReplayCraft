import { Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { summonReplayEntity } from "../summon-replay-entity";
import { debugError } from "../../data/util/debug";
import { findLastRecordedTick } from "../../data/util/resolver";

export async function doViewReplay(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    if (session.isReplayActive) {
        if (session.textPrompt) {
            player.sendMessage({ rawtext: [{ translate: "rc1.mes.replay.preview.is.already.on" }] });
        }
        if (session.soundCue) player.playSound("note.bass");
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
    if (!posData || posData.positions.size === 0) {
        debugError(`Replay position data not found for controller player ${controller.name}`);
        return;
    }

    // Get the first recorded tick
    const firstTick = findLastRecordedTick(posData.positions, 0);
    if (firstTick === null) {
        debugError(`No valid starting position found for controller player ${controller.name}`);
        return;
    }

    const summonPos = posData.positions.get(firstTick)!;

    // Teleport player if too far away to ensure chunk load
    const dx = player.location.x - summonPos.x;
    const dz = player.location.z - summonPos.z;
    const distanceSquared = dx * dx + dz * dz;
    const CHUNK_RADIUS = 4 * 16;
    const isFarAway = distanceSquared > CHUNK_RADIUS * CHUNK_RADIUS;

    if (isFarAway) {
        const success = player.tryTeleport(summonPos, { checkForBlocks: false });
        if (success) {
            // Small delay to ensure chunk load
            await new Promise<void>((resolve) => system.runTimeout(() => resolve(), 5));
        } else {
            debugError(`Teleport failed to load chunk at ${summonPos.x}, ${summonPos.y}, ${summonPos.z}`);
        }
    }

    // Summon only the controller entity at start of replay
    summonReplayEntity(session, controller, player.id);

    session.isReplayActive = true;

    // Hide HUD if needed
    if (session.hideHUD) {
        player.onScreenDisplay.setHudVisibility(0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }
}

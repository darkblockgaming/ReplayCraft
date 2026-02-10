import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { isChunkLoaded } from "../is-chunk-loaded";
import { summonReplayEntity } from "../summon-replay-entity";
import { waitForChunkLoad } from "../wait-for-chunk-load";
import { startReplayCam } from "./start-replay-camera";
import { removeEntities } from "../remove-entities";
import { debugError, debugLog, debugWarn } from "../../data/util/debug";
import { findLastRecordedTick } from "../../data/util/resolver";

export async function doReplay(player: Player, pointIndex?: number) {
    const session = replaySessions.playerSessions.get(player.id);

    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    if (session.isReplayActive) {
        if (session.textPrompt) {
            player.sendMessage({ rawtext: [{ translate: "rc1.mes.replay.is.already.in.progress" }] });
        }
        if (session.soundCue) player.playSound("note.bass");
        return;
    }

    session.replayStateMachine.setState("recStartRep");
    session.isReplayActive = true;

    // Hide HUD if needed
    if (session.hideHUD) {
        player.onScreenDisplay.setHudVisibility(0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }

    const posData = session.replayPositionDataMap.get(player.id);
    if (!posData || posData.positions.size === 0) {
        debugWarn(`No recorded positions found for player ${player.name}`);
        return;
    }

    // Get the closest recorded tick ≤ targetFrameTick
    const posTick = findLastRecordedTick(posData.positions, session.targetFrameTick);
    if (posTick === null) {
        debugWarn(`No valid recorded position found for player ${player.name} at tick ${session.targetFrameTick}`);
        return;
    }

    const firstRecordedPos = posData.positions.get(posTick)!;

    removeEntities(player, true); // Remove any existing entities before proceeding

    // Ensure chunk is loaded
    if (!isChunkLoaded(firstRecordedPos, player)) {
        debugLog(`Chunk not loaded for ${player.name}, teleporting...`);
        const success = player.tryTeleport(firstRecordedPos, { checkForBlocks: false });
        if (success) {
            await waitForChunkLoad(firstRecordedPos, player);
        } else {
            debugError(`Failed to teleport ${player.name} to load chunk at ${firstRecordedPos.x}, ${firstRecordedPos.y}, ${firstRecordedPos.z}`);
            return;
        }
    }

    // Start camera for affected players
    session.cameraAffectedPlayers.forEach((p) => startReplayCam(p, pointIndex));

    // Summon the replay entity for this player
    summonReplayEntity(session, player, player.id);
}

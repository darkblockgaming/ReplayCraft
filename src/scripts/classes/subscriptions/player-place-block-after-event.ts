import { PlayerPlaceBlockAfterEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { saveBedParts } from "../../functions/save-beds-parts";
import { saveDoorParts } from "../../functions/save-door-parts";
import { debugLog, debugWarn } from "../../data/util/debug";

function recordBlocks(event: PlayerPlaceBlockAfterEvent) {
    const { player, block } = event;

    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        debugWarn(`[ReplayCraft] No session found for ${player.name} (${player.id})`);
        return;
    }

    if (session.replayStateMachine.state !== "recPending") {
        debugWarn(`[ReplayCraft] Not in recPending state for ${player.name}, current state: ${session.replayStateMachine.state}`);
        return;
    }

    if (!session.trackedPlayers.includes(player)) {
        debugWarn(`[ReplayCraft] ${player.name} is not in session.trackedPlayers`);
        return;
    }

    if (block.typeId === "minecraft:bed" || session.twoPartBlocks.includes(block.type.id)) {
        debugLog(`[ReplayCraft] Saving multi-block structure (${block.typeId}) for ${player.name}`);
        if (block.typeId === "minecraft:bed") {
            saveBedParts(block, player);
        } else {
            saveDoorParts(block, player);
        }
    } else {
        const playerData = session.replayBlockStateMap.get(player.id);
        if (!playerData) {
            debugWarn(`[ReplayCraft] replayBlockStateMap not initialized for ${player.name}`);
            return;
        }

        const tick = session.recordingEndTick;
        playerData.blockStateChanges[tick] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };

        debugLog(`[ReplayCraft] Block recorded at tick ${tick} for ${player.name}`);
        debugLog(`[ReplayCraft] Block type: ${block.typeId}, Location: ${block.location.x}, ${block.location.y}, ${block.location.z}`);
    }
}

const replaycraftPlaceBlockAfterEvent = () => {
    world.afterEvents.playerPlaceBlock.subscribe(recordBlocks);
};

export { replaycraftPlaceBlockAfterEvent };

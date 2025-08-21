import { PlayerPlaceBlockAfterEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { saveBedParts } from "../../functions/bed-parts-break-after-event";
import { saveDoorParts } from "../../functions/door-parts-break-after-event";
import { debugLog, debugWarn } from "../../data/util/debug";
import config from "../../data/util/config";

function recordBlocks(event: PlayerPlaceBlockAfterEvent) {
    const { player, block } = event;

    // Case 1: Player has their own session
    let session = replaySessions.playerSessions.get(player.id);
    if (session) {
        if (session.replayStateMachine.state !== "recPending") {
            if (config.debugPlayerPlaceBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] ${player.name} has a session but it's not in recPending (state: ${session.replayStateMachine.state})`);
            }

            return;
        }

        if (!session.trackedPlayers.includes(player)) {
            if (config.debugPlayerPlaceBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] ${player.name} is not in their own trackedPlayers list`);
            }

            return;
        }
    } else {
        // Case 2: Player is a tracked guest in another recorder's session
        session = [...replaySessions.playerSessions.values()].find((s) => s.replayStateMachine.state === "recPending" && s.trackedPlayers.some((p) => p.id === player.id));

        if (!session) {
            if (config.debugPlayerPlaceBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] No session found tracking guest ${player.name} (${player.id})`);
            }

            return;
        }
    }

    // Continue with recording logic...

    if (block.typeId === "minecraft:bed" || session.twoPartBlocks.includes(block.type.id)) {
        if (config.debugPlayerPlaceBlockAfterEvent === true) {
            debugLog(`[ReplayCraft] Saving multi-block structure (${block.typeId}) for ${player.name}`);
        }

        if (block.typeId === "minecraft:bed") {
            saveBedParts(block, player, session);
        } else {
            saveDoorParts(block, player, session);
        }
    } else {
        let playerData = session.replayBlockStateMap.get(player.id);
        if (!playerData) {
            playerData = { blockStateChanges: {} };
            session.replayBlockStateMap.set(player.id, playerData);
            if (config.debugPlayerPlaceBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] Initialized replayBlockStateMap for guest ${player.name}`);
            }
        }

        const tick = session.recordingEndTick;
        playerData.blockStateChanges[tick] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };
        if (config.debugPlayerPlaceBlockAfterEvent === true) {
            debugLog(`[ReplayCraft] Block recorded at tick ${tick} for ${player.name}`);
            debugLog(`[ReplayCraft] Block type: ${block.typeId}, Location: ${block.location.x}, ${block.location.y}, ${block.location.z}`);
        }
    }
}

const replaycraftPlaceBlockAfterEvent = () => {
    world.afterEvents.playerPlaceBlock.subscribe(recordBlocks);
};

export { replaycraftPlaceBlockAfterEvent };

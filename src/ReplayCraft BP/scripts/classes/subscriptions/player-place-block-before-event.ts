import { saveBedParts1 } from "../../functions/bed-parts-break-before-event";
import { saveDoorParts1 } from "../../functions/door-parts-break-before-event";
import { replaySessions } from "../../data/replay-player-session";
import { PlayerPlaceBlockBeforeEvent, world } from "@minecraft/server";
import { debugWarn } from "../../data/util/debug";

function recordBlocks(event: PlayerPlaceBlockBeforeEvent) {
    const { player, block } = event;

    // Case 1: Player has their own session
    let session = replaySessions.playerSessions.get(player.id);
    if (session) {
        if (session.replayStateMachine.state !== "recPending") {
            debugWarn(`[ReplayCraft] ${player.name} has a session but it's not in recPending (state: ${session.replayStateMachine.state})`);
            return;
        }

        if (!session.trackedPlayers.includes(player)) {
            debugWarn(`[ReplayCraft] ${player.name} is not in their own trackedPlayers list`);
            return;
        }
    } else {
        // Case 2: Player is a tracked guest in another recorder's session
        session = [...replaySessions.playerSessions.values()].find((s) => s.replayStateMachine.state === "recPending" && s.trackedPlayers.some((p) => p.id === player.id));

        if (!session) {
            debugWarn(`[ReplayCraft] No session found tracking guest ${player.name} (${player.id})`);
            return;
        }
    }

    if (block.typeId === "minecraft:bed" || session.twoPartBlocks.includes(block.type.id)) {
        if (block.typeId === "minecraft:bed") {
            saveBedParts1(block, player, session);
        } else {
            saveDoorParts1(block, player, session);
        }
    } else {
        let playerData = session.replayBlockInteractionBeforeMap.get(player.id);
        if (!playerData) {
            playerData = { blockStateBeforeInteractions: {} };
            session.replayBlockInteractionBeforeMap.set(player.id, playerData);
        }
        playerData.blockStateBeforeInteractions[session.recordingEndTick] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };
    }
}

const replaycraftPlaceBlockBeforeEvent = () => {
    world.beforeEvents.playerPlaceBlock.subscribe(recordBlocks);
};

export { replaycraftPlaceBlockBeforeEvent };

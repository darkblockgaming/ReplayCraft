import { PlayerBreakBlockAfterEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { debugWarn } from "../../data/util/debug";
import { saveBedParts } from "../../functions/bed-parts-break-after-event";
import { saveDoorParts } from "../../functions/door-parts-break-after-event";
import config from "../../data/util/config";

//saveBedParts = bed-parts-break-after-event
//saveDoorParts = door-parts-break-after-event

function recordBlocks(event: PlayerBreakBlockAfterEvent) {
    const { player, block } = event;
    // Case 1: Player has their own session
    let session = replaySessions.playerSessions.get(player.id);
    if (session) {
        if (session.replayStateMachine.state !== "recPending") {
            if (config.debugPlayerBreakBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] ${player.name} has a session but it's not in recPending (state: ${session.replayStateMachine.state})`);
            }

            return;
        }

        if (!session.trackedPlayers.includes(player)) {
            if (config.debugPlayerBreakBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] ${player.name} is not in their own trackedPlayers list`);
            }

            return;
        }
    } else {
        // Case 2: Player is a tracked guest in another recorder's session
        session = [...replaySessions.playerSessions.values()].find((s) => s.replayStateMachine.state === "recPending" && s.trackedPlayers.some((p) => p.id === player.id));

        if (!session) {
            if (config.debugPlayerBreakBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] No session found tracking guest ${player.name} (${player.id})`);
            }

            return;
        }
    }

    if (block.typeId === "minecraft:bed" || session.twoPartBlocks.includes(block.type.id)) {
        if (block.typeId === "minecraft:bed") {
            saveBedParts(block, player, session);
        } else {
            saveDoorParts(block, player, session);
        }
    } else {
        let playerBlockData = session.replayBlockInteractionAfterMap.get(player.id);

        if (!playerBlockData) {
            playerBlockData = { blockSateAfterInteractions: {} };
            session.replayBlockInteractionAfterMap.set(player.id, playerBlockData);
            if (config.debugPlayerBreakBlockAfterEvent === true) {
                debugWarn(`[ReplayCraft] Initialized replayBlockInteractionAfterMap for guest ${player.name}`);
            }
        }
        playerBlockData.blockSateAfterInteractions[session.recordingEndTick] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
            eventType: "break",
        };
    }
}

const replaycraftBreakBlockAfterEvent = () => {
    world.afterEvents.playerBreakBlock.subscribe(recordBlocks);
};

export { replaycraftBreakBlockAfterEvent };

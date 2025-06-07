import { PlayerInteractWithBlockAfterEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { saveDoorPartsB } from "../../functions/save-door-partsb";

// Suggested function name: handleBlockInteractionRecording
function recordBlocks(event: PlayerInteractWithBlockAfterEvent) {
    const { player, block, itemStack } = event;

    const session = replaySessions.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;
    if (!session.trackedPlayers.includes(player)) return;

    if (session.twoPartBlocks.includes(block.type.id)) {
        saveDoorPartsB(block, player);
    } else {
        const playerBlockData = session.replayBlockInteractionAfterMap.get(player.id);
        if (!playerBlockData) return;

        playerBlockData.blockSateAfterInteractions[session.recordingEndTick] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };
    }

    if (itemStack?.typeId === "minecraft:water_bucket") {
        console.log("block loc: " + block.location);
        console.log("block face: " + event.blockFace);
        console.log("states: ", block.permutation.getAllStates());
    }
}

const replaycraftInteractWithBlockAfterEvent = () => {
    world.afterEvents.playerInteractWithBlock.subscribe(recordBlocks);
};

export { replaycraftInteractWithBlockAfterEvent };

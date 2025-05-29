import { PlayerInteractWithBlockAfterEvent, world } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
import { saveDoorPartsB } from "../../functions/saveDoorPartsB";

// Suggested function name: handleBlockInteractionRecording
function recordBlocks(event: PlayerInteractWithBlockAfterEvent) {
    const { player, block, itemStack } = event;

    const session = SharedVariables.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;
    if (!session.multiPlayers.includes(player)) return;

    if (session.twoPartBlocks.includes(block.type.id)) {
        saveDoorPartsB(block, player);
    } else {
        const playerBlockData = session.replayBDataBMap.get(player.id);
        if (!playerBlockData) return;

        playerBlockData.dbgBlockDataB[session.dbgRecTime] = {
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

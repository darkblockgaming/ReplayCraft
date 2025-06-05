import { PlayerInteractWithBlockBeforeEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { saveDoorParts1 } from "../../functions/saveDoorsParts1";

function recordBlocks(event: PlayerInteractWithBlockBeforeEvent) {
    const { player, block } = event;

    const session = replaySessions.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;
    if (!session.multiPlayers.includes(player)) return;

    if (session.twoPartBlocks.includes(block.type.id)) {
        saveDoorParts1(block, player);
    } else {
        const playerData = session.replayBData1Map.get(player.id);
        if (!playerData) return;

        playerData.blockStateBeforeInteractions[session.dbgRecTime] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };
    }
}

const replaycraftInteractWithBlockBeforeEvent = () => {
    world.beforeEvents.playerInteractWithBlock.subscribe(recordBlocks);
};

export { replaycraftInteractWithBlockBeforeEvent };

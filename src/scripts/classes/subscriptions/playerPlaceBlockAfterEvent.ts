import { PlayerPlaceBlockAfterEvent, world } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
import { saveBedParts } from "../../functions/saveBedsParts";
import { saveDoorParts } from "../../functions/saveDoorParts";

function recordBlocks(event: PlayerPlaceBlockAfterEvent) {
    const { player, block } = event;

    const session = SharedVariables.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;
    if (!session.multiPlayers.includes(player)) return;

    if (block.typeId === "minecraft:bed" || session.twoPartBlocks.includes(block.type.id)) {
        if (block.typeId === "minecraft:bed") {
            saveBedParts(block, player);
        } else {
            saveDoorParts(block, player);
        }
    } else {
        const playerData = session.replayBDataMap.get(player.id);
        if (!playerData) return;

        playerData.dbgBlockData[session.dbgRecTime] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };
    }
}

const replaycraftPlaceBlockAfterEvent = () => {
    world.afterEvents.playerPlaceBlock.subscribe(recordBlocks);
};

export { replaycraftPlaceBlockAfterEvent };

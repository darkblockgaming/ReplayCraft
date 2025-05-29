import { saveBedParts1 } from "../../functions/saveBedParts1";
import { saveDoorParts1 } from "../../functions/saveDoorsParts1";
import { SharedVariables } from "../../data/replay-player-session";
import { PlayerPlaceBlockBeforeEvent, world } from "@minecraft/server";

function recordBlocks(event: PlayerPlaceBlockBeforeEvent) {
    const { player, block } = event;

    const session = SharedVariables.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;
    if (!session.multiPlayers.includes(player)) return;

    if (block.typeId === "minecraft:bed" || session.twoPartBlocks.includes(block.type.id)) {
        if (block.typeId === "minecraft:bed") {
            saveBedParts1(block, player);
        } else {
            saveDoorParts1(block, player);
        }
    } else {
        const playerData = session.replayBData1Map.get(player.id);
        if (!playerData) return;

        playerData.dbgBlockData1[session.dbgRecTime] = {
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

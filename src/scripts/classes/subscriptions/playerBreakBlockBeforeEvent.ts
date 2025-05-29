import { saveBedParts1 } from "../../functions/saveBedParts1";
import { saveDoorParts1 } from "../../functions/saveDoorsParts1";
import { SharedVariables } from "../../data/replay-player-session";
import { PlayerBreakBlockBeforeEvent, world } from "@minecraft/server";

//@ts-check
function recordBlocks(event: PlayerBreakBlockBeforeEvent) {
    const { player, block } = event;

    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) return;

    if (session.replayStateMachine.state !== "recPending") return;
    if (!session.multiPlayers.includes(player)) return;

    if (block.typeId === "minecraft:bed" || session.twoPartBlocks.includes(block.type.id)) {
        if (block.typeId === "minecraft:bed") {
            saveBedParts1(block, player);
        } else {
            saveDoorParts1(block, player);
        }
    } else {
        session.dbgBlockData1[session.dbgRecTime] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };
    }
}

const replaycraftBreakBlockBeforeEvent = () => {
    world.beforeEvents.playerBreakBlock.subscribe(recordBlocks);
};

export { replaycraftBreakBlockBeforeEvent };

import { PlayerBreakBlockAfterEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { saveBedParts } from "../../functions/bed-parts-break-after-event";
import { saveDoorParts } from "../../functions/door-parts-break-after-event";

//saveBedParts = bed-parts-break-after-event
//saveDoorParts = door-parts-break-after-event

function recordBlocks(event: PlayerBreakBlockAfterEvent) {
    const { player, block } = event;
    const session = replaySessions.playerSessions.get(player.id);

    if (!session) return;
    if (session.replayStateMachine.state !== "recPending") return;

    if (block.typeId === "minecraft:bed" || session.twoPartBlocks.includes(block.type.id)) {
        if (block.typeId === "minecraft:bed") {
            saveBedParts(block, player);
        } else {
            saveDoorParts(block, player);
        }
    } else {
        session.blockAfterEventData[session.recordingEndTick] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };
    }
}

const replaycraftBreakBlockAfterEvent = () => {
    world.afterEvents.playerBreakBlock.subscribe(recordBlocks);
};

export { replaycraftBreakBlockAfterEvent };

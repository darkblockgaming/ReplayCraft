import { saveBedParts1 } from "../../functions/bed-parts-break-before-event";
import { saveDoorParts1 } from "../../functions/door-parts-break-before-event";
import { replaySessions } from "../../data/replay-player-session";
import { PlayerBreakBlockBeforeEvent, world } from "@minecraft/server";
//saveBedParts1 = bed-parts-break-before-event
//saveDoorParts1 = door-parts-break-before-event

//@ts-check
function recordBlocks(event: PlayerBreakBlockBeforeEvent) {
    const { player, block } = event;

    const session = replaySessions.playerSessions.get(player.id);
    if (!session) return;

    if (session.replayStateMachine.state !== "recPending") return;
    if (!session.trackedPlayers.includes(player)) return;

    if (block.typeId === "minecraft:bed" || session.twoPartBlocks.includes(block.type.id)) {
        if (block.typeId === "minecraft:bed") {
            saveBedParts1(block, player);
        } else {
            saveDoorParts1(block, player);
        }
    } else {
        const playerData = session.replayBlockInteractionBeforeMap.get(player.id);
        if (!playerData) return;

        playerData.blockStateBeforeInteractions[session.recordingEndTick] = {
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

import { saveBedParts1 } from "../../functions/save-bed-parts1";
import { saveDoorParts1 } from "../../functions/save-doors-parts1";
import { replaySessions } from "../../data/replay-player-session";
import { PlayerPlaceBlockBeforeEvent, world } from "@minecraft/server";

function recordBlocks(event: PlayerPlaceBlockBeforeEvent) {
    const { player, block } = event;

    const session = replaySessions.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;
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

const replaycraftPlaceBlockBeforeEvent = () => {
    world.beforeEvents.playerPlaceBlock.subscribe(recordBlocks);
};

export { replaycraftPlaceBlockBeforeEvent };

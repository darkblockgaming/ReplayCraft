import { PlayerInteractWithBlockBeforeEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { saveDoorParts1 } from "../../functions/door-parts-break-before-event";
import { getOffsetFromBlockFace } from "../../data/util/block-face-to-offset";

function recordBlocks(event: PlayerInteractWithBlockBeforeEvent) {
    const { player, block, itemStack, blockFace } = event;

    const session = replaySessions.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;
    if (!session.trackedPlayers.includes(player)) return;

    const isBucket = itemStack?.typeId === "minecraft:water_bucket" || itemStack?.typeId === "minecraft:powder_snow_bucket" || itemStack?.typeId === "minecraft:lava_bucket";

    if (isBucket) {
        const normalizedFace = blockFace.toLowerCase();
        const offset = getOffsetFromBlockFace(normalizedFace);
        const placePos = {
            x: block.location.x + offset.x,
            y: block.location.y + offset.y,
            z: block.location.z + offset.z,
        };

        const placedBlock = block.dimension.getBlock(placePos);
        if (!placedBlock) return;

        const playerData = session.replayBlockInteractionBeforeMap.get(player.id);
        if (!playerData) return;

        playerData.blockStateBeforeInteractions[session.recordingEndTick] = {
            location: placePos,
            typeId: placedBlock.typeId,
            states: placedBlock.permutation.getAllStates(),
        };
        return;
    }

    if (session.twoPartBlocks.includes(block.type.id)) {
        saveDoorParts1(block, player);
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

const replaycraftInteractWithBlockBeforeEvent = () => {
    world.beforeEvents.playerInteractWithBlock.subscribe(recordBlocks);
};

export { replaycraftInteractWithBlockBeforeEvent };

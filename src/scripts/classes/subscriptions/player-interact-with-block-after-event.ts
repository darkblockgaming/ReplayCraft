import { PlayerInteractWithBlockAfterEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { saveDoorPartsB } from "../../functions/door-parts-interact-with-block-after-event";
import { getOffsetFromBlockFace } from "../../data/util/block-face-to-offset";

function recordBlocks(event: PlayerInteractWithBlockAfterEvent) {
    const { player, block, itemStack, blockFace } = event;

    const session = replaySessions.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;
    if (!session.trackedPlayers.includes(player)) return;
    if (!itemStack) return;

    const isBucket = itemStack.typeId === "minecraft:water_bucket" || itemStack.typeId === "minecraft:powder_snow_bucket" || itemStack.typeId === "minecraft:lava_bucket";

    if (isBucket) {
        const normalizedFace = blockFace.toLowerCase();
        const offset = getOffsetFromBlockFace(normalizedFace);
        const placePos = {
            x: block.location.x + offset.x,
            y: block.location.y + offset.y,
            z: block.location.z + offset.z,
        };
        const placedBlock = block.dimension.getBlock(placePos);

        console.log(`[DEBUG] Player ${player.name} placed block at: x=${placePos.x}, y=${placePos.y}, z=${placePos.z}`);
        console.log(`[DEBUG] blockFace: ${blockFace}, normalized: ${normalizedFace}, offset: x=${offset.x}, y=${offset.y}, z=${offset.z}`);

        console.log(`[DEBUG] Block at placePos: ${placedBlock.typeId}`);

        const playerData = session.replayBlockStateMap.get(player.id);
        if (!playerData) return;

        switch (itemStack.typeId) {
            case "minecraft:water_bucket":
                playerData.blockStateChanges[session.recordingEndTick] = {
                    location: placePos,
                    typeId: "minecraft:flowing_water",
                    states: {},
                };
                break;
            case "minecraft:lava_bucket":
                playerData.blockStateChanges[session.recordingEndTick] = {
                    location: placePos,
                    typeId: "minecraft:flowing_lava",
                    states: {},
                };
                break;
            case "minecraft:powder_snow_bucket":
                playerData.blockStateChanges[session.recordingEndTick] = {
                    location: placePos,
                    typeId: "minecraft:powder_snow",
                    states: {},
                };
                break;
            default:
                // Just in case
                return;
        }
        return;
    }

    if (session.twoPartBlocks.includes(block.type.id)) {
        saveDoorPartsB(block, player);
    } else {
        const playerData = session.replayBlockInteractionAfterMap.get(player.id);
        if (!playerData) return;

        playerData.blockSateAfterInteractions[session.recordingEndTick] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };
    }
}

const replaycraftInteractWithBlockAfterEvent = () => {
    world.afterEvents.playerInteractWithBlock.subscribe(recordBlocks);
};

export { replaycraftInteractWithBlockAfterEvent };

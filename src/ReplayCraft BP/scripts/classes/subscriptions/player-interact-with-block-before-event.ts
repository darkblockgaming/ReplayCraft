import { PlayerInteractWithBlockBeforeEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { saveDoorParts1 } from "../../functions/door-parts-break-before-event";
import { getOffsetFromBlockFace } from "../../data/util/block-face-to-offset";
import { debugWarn } from "../../data/util/debug";

function recordBlocks(event: PlayerInteractWithBlockBeforeEvent) {
    const { player, block, itemStack, blockFace } = event;

    let session = replaySessions.playerSessions.get(player.id);
    if (session) {
        if (session.replayStateMachine.state !== "recPending") return;
        if (!session.trackedPlayers.includes(player)) return;
    } else {
        session = [...replaySessions.playerSessions.values()].find((s) => s.replayStateMachine.state === "recPending" && s.trackedPlayers.some((p) => p.id === player.id));
        if (!session) return;
    }

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

        let playerData = session.replayBlockInteractionBeforeMap.get(player.id);

        if (!playerData) {
            playerData = { blockStateBeforeInteractions: {} };
            session.replayBlockInteractionBeforeMap.set(player.id, playerData);
            debugWarn(`[ReplayCraft] Initialized replayBlockInteractionBeforeMap for guest ${player.name}`);
        }

        playerData.blockStateBeforeInteractions[session.recordingEndTick] = {
            location: placePos,
            typeId: placedBlock.typeId,
            states: placedBlock.permutation.getAllStates(),
        };
        return;
    }

    if (session.twoPartBlocks.includes(block.type.id)) {
        console.log(`[ReplayCraft] Recording two-part block before interaction for ${block.typeId} at ${block.location.x}, ${block.location.y}, ${block.location.z} by player ${player.name}`);
        saveDoorParts1(block, player, session);
    } else {
        let playerData = session.replayBlockInteractionBeforeMap.get(player.id);

        if (!playerData) {
            playerData = { blockStateBeforeInteractions: {} };
            session.replayBlockInteractionBeforeMap.set(player.id, playerData);
            debugWarn(`[ReplayCraft] Initialized replayBlockInteractionBeforeMap for guest ${player.name}`);
        }

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

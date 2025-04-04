import { Player } from "@minecraft/server";
import { SharedVariables } from "../main";
import {isChunkLoaded} from "./isChunkLoaded.js";
import { waitForChunkLoad } from "./waitForChunkLoad.js";

export async function loadEntity(player: Player) {
    const posData = SharedVariables.replayPosDataMap.get(player.id);
    const rotData = SharedVariables.replayRotDataMap.get(player.id);
    if (!posData || !rotData || posData.dbgRecPos.length === 0) {
        console.error(`Replay data missing for player ${player.name}`);
        return;
    }

    let customEntity;
    const maxIndex = Math.min(SharedVariables.wantLoadFrameTick, posData.dbgRecPos.length - 1);
    const summonPos = posData.dbgRecPos[maxIndex];

    // Ensure chunk is loaded
    if (!isChunkLoaded(summonPos, player)) {
        console.log(`Chunk not loaded for ${player.name}, teleporting...`);

        // Teleport player near the chunk to load it
        const success = player.tryTeleport(summonPos, { checkForBlocks: false });

        if (success) {
            await waitForChunkLoad(summonPos, player);
        } else {
            console.error(`Failed to teleport ${player.name} to load chunk at ${summonPos.x}, ${summonPos.y}, ${summonPos.z}`);
            return;
        }
    }

    // Now summon the entity
    try {
        customEntity = player.dimension.spawnEntity("dbg:replayentity", summonPos);
        customEntity.setRotation(rotData.dbgRecRot[maxIndex]);
    } catch (error) {
        console.error(`Error spawning entity at ${summonPos.x}, ${summonPos.y}, ${summonPos.z}:`, error);
        return;
    }

    customEntity.nameTag = player.name;
}
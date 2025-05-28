import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { SharedVariables } from "../main";
import {isChunkLoaded} from "./isChunkLoaded.js";
import { waitForChunkLoad } from "./waitForChunkLoad.js";
import { replayCraftSkinDB } from "../classes/subscriptions/world-initialize";
import { removeEntities } from "./removeEntities";

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
        removeEntities(player,true)
        let skinData = replayCraftSkinDB.get(player.id);
        if (!skinData) {
            console.error(`[ReplayCraft] Failed to retrieve skin data for ${player.id}, have they set a skin?`);
           skinData = "0,0";
        }
        const [skinIDStr, modelIDStr] = skinData.split(",");
        let skinID = parseInt(skinIDStr);
        let modelID = parseInt(modelIDStr);
      
        if(modelID === 0){
            customEntity = player.dimension.spawnEntity("dbg:replayentity_steve" as VanillaEntityIdentifier,  summonPos);
            customEntity.setRotation(rotData.dbgRecRot[maxIndex]);
        }
        if(modelID === 1){
            customEntity = player.dimension.spawnEntity("dbg:replayentity_alex" as VanillaEntityIdentifier,  summonPos);
            customEntity.setRotation(rotData.dbgRecRot[maxIndex]); 
        }
        customEntity.setProperty("dbg:skin", skinID );
        if (SharedVariables.settNameType === 0) {
            customEntity.nameTag = player.name;
        } else if (SharedVariables.settNameType === 1) {
            customEntity.nameTag = player.name;
        } else if (SharedVariables.settNameType === 2) {
            customEntity.nameTag = SharedVariables.settCustomName;
        }
    } catch (error) {
        console.error(`Error spawning entity at ${summonPos.x}, ${summonPos.y}, ${summonPos.z}:`, error);
        return;
    }

    customEntity.nameTag = player.name;
}
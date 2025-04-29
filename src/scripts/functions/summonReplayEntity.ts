import { Player } from "@minecraft/server";
import { SharedVariables } from "../main";
import { replayCraftSkinDB } from "../classes/subscriptions/world-initialize";

//@ts-check
export function summonReplayEntity(player: Player) {
    const posData = SharedVariables.replayPosDataMap.get(player.id);
   // const rotData = SharedVariables.replayRotDataMap.get(player.id);
    let customEntity = undefined;
    if (!posData) return;

    if (SharedVariables.settReplayType === 0) {
        //set the skin based on the skin database
        let skinData = replayCraftSkinDB.get(player.id);
        if (!skinData) {
            console.error(`[ReplayCraft] Failed to retrieve skin data for ${player.id}, have they set a skin?`);
           skinData = "0,0";
        }
        const [skinIDStr, modelIDStr] = skinData.split(",");
        let skinID = parseInt(skinIDStr);
        let modelID = parseInt(modelIDStr);
      
        if(modelID === 0){
            customEntity = player.dimension.spawnEntity("dbg:replayentity_steve", posData.dbgRecPos[0]);
        }
        if(modelID === 1){
            customEntity = player.dimension.spawnEntity("dbg:replayentity_alex", posData.dbgRecPos[0]); 
        }
        customEntity.setProperty("dbg:skin", skinID );
        if (SharedVariables.settNameType === 0) {
            customEntity.nameTag = player.name;
        } else if (SharedVariables.settNameType === 1) {
            customEntity.nameTag = player.name;
        } else if (SharedVariables.settNameType === 2) {
            customEntity.nameTag = SharedVariables.settCustomName;
        }
        SharedVariables.replayODataMap.set(player.id, customEntity);

    }
}
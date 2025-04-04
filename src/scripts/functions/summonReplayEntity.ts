import { Player } from "@minecraft/server";
import { SharedVariables } from "../main";

//@ts-check
export function summonReplayEntity(player: Player) {
    const posData = SharedVariables.replayPosDataMap.get(player.id);
    const rotData = SharedVariables.replayRotDataMap.get(player.id);
    let customEntity = undefined;
    if (!posData) return;

    if (SharedVariables.settReplayType === 0) {
        customEntity = player.dimension.spawnEntity("dbg:replayentity", posData.dbgRecPos[0]);
        customEntity.setProperty("dbg:skin", SharedVariables.choosenReplaySkin);

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
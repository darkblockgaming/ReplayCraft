import { SharedVariables } from "../main";

//@ts-check
export function summonReplayEntity(player) {
    const posData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
    const rotData = SharedVariables.replayRotDataMap.get(player.id);
    let customEntity = undefined;
    if (!posData) return;

    if (settReplayType === 0) {
        customEntity = player.dimension.spawnEntity("dbg:replayentity", posData.dbgRecPos[0]);
        customEntity.setProperty("dbg:skin", choosenReplaySkin);

        if (settNameType === 0) {
            customEntity.nameTag = player.name;
        } else if (settNameType === 1) {
            customEntity.nameTag = player.name;
        } else if (settNameType === 2) {
            customEntity.nameTag = settCustomName;
        }
        SharedVariables.replayODataMap.set(player.id, customEntity);

    }
}
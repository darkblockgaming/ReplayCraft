import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { SharedVariables } from "../data/replay-player-session.js";
import { replayCraftSkinDB } from "../classes/subscriptions/world-initialize";

//@ts-check
export function summonReplayEntity(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    const posData = session.replayPosDataMap.get(player.id);
    const rotData = session.replayRotDataMap.get(player.id);
    const pData = session.replayMDataMap.get(player.id);

    if (!posData) return;

    let customEntity;

    if (session.settReplayType === 0) {
        // Get skin and model data
        let skinData = replayCraftSkinDB.get(player.id);
        if (!skinData) {
            console.error(`[ReplayCraft] Failed to retrieve skin data for ${player.id}, have they set a skin?`);
            skinData = "0,0";
        }

        const [skinIDStr, modelIDStr] = skinData.split(",");
        const skinID = parseInt(skinIDStr);
        const modelID = parseInt(modelIDStr);

        const startTick = session.wantLoadFrameTick ?? 0;
        const closestFrame = posData.dbgRecPos.reduce((prev: { tick: number }, curr: { tick: number }) => {
            return Math.abs(curr.tick - startTick) < Math.abs(prev.tick - startTick) ? curr : prev;
        }, posData.dbgRecPos[0]);

        const spawnPos = {
            x: closestFrame.x,
            y: closestFrame.y,
            z: closestFrame.z,
        };

        const entityType = modelID === 0 ? ("dbg:replayentity_steve" as VanillaEntityIdentifier) : ("dbg:replayentity_alex" as VanillaEntityIdentifier);

        customEntity = player.dimension.spawnEntity(entityType, spawnPos);

        if (!customEntity) {
            console.error(`[ReplayCraft] Failed to spawn replay entity for ${player.name}`);
            return;
        }
        customEntity.addTag("owner:" + player.id);

        // Set skin and name tag
        customEntity.setProperty("dbg:skin", skinID);
        switch (session.settNameType) {
            case 0:
            case 1:
                customEntity.nameTag = player.name;
                break;
            case 2:
                customEntity.nameTag = session.settCustomName;
                break;
        }

        // Store entity
        session.replayODataMap.set(player.id, customEntity);

        // === Sync entity to exact start tick position/rotation ===
        const posAtTick = posData.dbgRecPos[startTick];
        const rotAtTick = rotData?.dbgRecRot?.[startTick];

        if (posAtTick && rotAtTick) {
            customEntity.teleport(posAtTick, { rotation: rotAtTick });

            // Sneaking state if present
            if (pData?.isSneaking?.[startTick] !== undefined) {
                customEntity.isSneaking = pData.isSneaking[startTick] === 1;
            }
        } else {
            console.warn(`[ReplayCraft] Could not find position or rotation at tick ${startTick} for ${player.name}`);
        }
    }
}

import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session.js";
import { replayCraftSkinDB } from "../classes/subscriptions/world-initialize.js";

//@ts-check
export function summonReplayEntity(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    const posData = session.replayPositionDataMap.get(player.id);
    const rotData = session.replayRotationDataMap.get(player.id);
    const pData = session.replayActionDataMap.get(player.id);

    if (!posData) return;

    let customEntity;

    if (session.settingReplayType === 0) {
        // Get skin and model data
        let skinData = replayCraftSkinDB.get(player.id);
        if (!skinData) {
            console.error(`[ReplayCraft] Failed to retrieve skin data for ${player.id}, have they set a skin?`);
            skinData = "0,0";
        }

        const [skinIDStr, modelIDStr] = skinData.split(",");
        const skinID = parseInt(skinIDStr);
        const modelID = parseInt(modelIDStr);

        const startTick = session.targetFrameTick;
        const totalTicks = Math.min(posData.recordedPositions.length, session.recordingEndTick);
        const clampedTick = Math.min(Math.max(startTick, 0), totalTicks - 1);
        const closestFrame = posData.recordedPositions[clampedTick];

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
        switch (session.settingNameType) {
            case 0:
            case 1:
                customEntity.nameTag = player.name;
                break;
            case 2:
                customEntity.nameTag = session.settingCustomName;
                break;
        }

        // Store entity
        session.replayEntityDataMap.set(player.id, { customEntity });

        // === Sync entity to exact start tick position/rotation ===
        const posAtTick = posData.recordedPositions[startTick];
        const rotAtTick = rotData?.recordedRotations?.[startTick];

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

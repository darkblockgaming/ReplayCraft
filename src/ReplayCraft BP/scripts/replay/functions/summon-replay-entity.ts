import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { PlayerReplaySession } from "../data/replay-player-session.js";
import { replayCraftSkinDB } from "../classes/subscriptions/world-initialize.js";
import { debugError } from "../data/util/debug.js";

//@ts-check
export function summonReplayEntity(session: PlayerReplaySession, onlinePlayer: Player, offlinePlayerId?: string, offlinePlayerName?: string) {
    if (!session) {
        onlinePlayer.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    // Use offlinePlayerId if provided, otherwise fallback to onlinePlayer.id
    const targetPlayerId = offlinePlayerId ?? onlinePlayer.id;

    // Retrieve replay data keyed by the offline player (target)
    const posData = session.replayPositionDataMap.get(targetPlayerId);
    const rotData = session.replayRotationDataMap.get(targetPlayerId);
    const pData = session.replayActionDataMap.get(targetPlayerId);

    if (!posData) return;

    if (session.settingReplayType === 0) {
        // Get skin and model data keyed by offline player ID
        let skinData = replayCraftSkinDB.get(targetPlayerId);
        if (!skinData) {
            debugError(`[ReplayCraft] Failed to retrieve skin data for ${targetPlayerId}, have they set a skin?`);
            skinData = "0,0,0";
        }

        const [skinIDStr, modelIDStr, capeIDStr] = skinData.split(",");
        const skinID = parseInt(skinIDStr);
        const modelID = parseInt(modelIDStr);
        let capeID: number;
        if (capeIDStr === undefined || capeIDStr === "") {
            debugError(`[ReplayCraft] Failed to retrieve cape data for ${targetPlayerId}, have they set a cape?`);
            capeID = 0;
        } else {
            capeID = parseInt(capeIDStr);
        }

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

        // Spawn entity in the onlinePlayer's dimension
        const customEntity = onlinePlayer.dimension.spawnEntity(entityType, spawnPos);

        if (!customEntity) {
            console.error(`[ReplayCraft] Failed to spawn replay entity for ${onlinePlayer.name}`);
            return;
        }

        // Tag with owner as onlinePlayer.id
        customEntity.addTag("owner:" + onlinePlayer.id);

        // Set skin and name tag
        customEntity.setProperty("dbg:skin", skinID);
        // Set cape property
        customEntity.setProperty("rc:cape", capeID);
        switch (session.settingNameType) {
            case 0:
            case 1:
                customEntity.nameTag = offlinePlayerName ?? onlinePlayer.name;
                break;
            case 2:
                customEntity.nameTag = session.settingCustomName;
                break;
        }

        // Store entity keyed by the online player ID
        session.replayEntityDataMap.set(targetPlayerId, { customEntity });
        console.warn(`[ReplayCraft] Stored replay entity for ${targetPlayerId} at tick ${startTick}`);

        // Sync entity position and rotation at the start tick
        const posAtTick = posData.recordedPositions[startTick];
        const rotAtTick = rotData?.recordedRotations?.[startTick];

        if (posAtTick && rotAtTick) {
            customEntity.teleport(posAtTick, { rotation: rotAtTick });

            // Apply sneaking state if present
            if (pData?.isSneaking?.[startTick] !== undefined) {
                customEntity.isSneaking = pData.isSneaking[startTick] === 1;
            }
        } else {
            console.warn(`[ReplayCraft] Could not find position or rotation at tick ${startTick} for player ${targetPlayerId}`);
        }
    }
}

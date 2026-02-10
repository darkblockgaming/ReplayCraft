import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { PlayerReplaySession } from "../data/replay-player-session.js";
import { replayCraftSkinDB } from "../classes/subscriptions/world-initialize.js";
import { debugError, debugWarn } from "../data/util/debug.js";
import { findLastRecordedTick, resolveFlagsAtTick, resolveRidingTypeAtTick } from "../data/util/resolver.js";
import { ActionFlags } from "../classes/types/types.js";
import { safeSet } from "../../main.js";

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

        // Find the last recorded tick for position and rotation
        const posTick = findLastRecordedTick(posData.positions, startTick);
        const rotTick = rotData ? findLastRecordedTick(rotData.rotations, startTick) : null;

        const posAtTick = posTick !== null ? posData.positions.get(posTick) : undefined;
        const rotAtTick = rotTick !== null ? rotData?.rotations.get(rotTick) : undefined;

        if (!posAtTick || !rotAtTick) {
            debugWarn(`[ReplayCraft] Could not find position or rotation at tick ${startTick} for player ${targetPlayerId}`);
            return;
        }

        // Spawn entity at the last recorded position
        const spawnPos = { x: posAtTick.x, y: posAtTick.y, z: posAtTick.z };
        const entityType = modelID === 0 ? ("dbg:replayentity_steve" as VanillaEntityIdentifier) : ("dbg:replayentity_alex" as VanillaEntityIdentifier);

        const customEntity = onlinePlayer.dimension.spawnEntity(entityType, spawnPos);
        if (!customEntity) {
            debugError(`[ReplayCraft] Failed to spawn replay entity for ${onlinePlayer.name}`);
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
        debugWarn(`[ReplayCraft] Stored replay entity for ${targetPlayerId} at tick ${startTick}`);

        // Sync entity position and rotation at the start tick
        //const posAtTick = posData.recordedPositions[startTick];
        //const rotAtTick = rotData?.recordedRotations?.[startTick];

        if (posAtTick && rotAtTick) {
            customEntity.teleport(posAtTick, { rotation: rotAtTick });

            // Apply sneaking state if present
            if (pData) {
                // Resolve flags at this tick
                const flags = resolveFlagsAtTick(pData, startTick);

                // Apply sneaking
                customEntity.isSneaking = (flags & ActionFlags.Sneaking) !== 0;

                // Apply swimming
                safeSet(customEntity, "rc:is_swimming", (flags & ActionFlags.Swimming) !== 0);

                // Apply climbing
                safeSet(customEntity, "rc:is_climbing", (flags & ActionFlags.Climbing) !== 0);

                // Apply falling
                safeSet(customEntity, "rc:is_falling", (flags & ActionFlags.Falling) !== 0);

                // Apply flying
                safeSet(customEntity, "rc:is_flying", (flags & ActionFlags.Flying) !== 0);

                // Apply gliding
                safeSet(customEntity, "rc:is_gliding", (flags & ActionFlags.Gliding) !== 0);

                // Apply sprinting
                safeSet(customEntity, "rc:is_sprinting", (flags & ActionFlags.Sprinting) !== 0);

                // Apply sleeping
                safeSet(customEntity, "rc:is_sleeping", (flags & ActionFlags.Sleeping) !== 0);

                // Apply crawling
                safeSet(customEntity, "rc:is_crawling", (flags & ActionFlags.Crawling) !== 0);

                // Apply riding state and entity type
                const isRiding = (flags & ActionFlags.Riding) !== 0;
                const ridingType = resolveRidingTypeAtTick(pData, startTick);
                safeSet(customEntity, "rc:is_riding", isRiding);
                safeSet(customEntity, "rc:riding_type", ridingType);
            }
        } else {
            debugWarn(`[ReplayCraft] Could not find position or rotation at tick ${startTick} for player ${targetPlayerId}`);
        }
    }
}

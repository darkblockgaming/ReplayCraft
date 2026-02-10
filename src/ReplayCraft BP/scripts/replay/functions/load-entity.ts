import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session.js";
import { isChunkLoaded } from "./is-chunk-loaded.js";
import { waitForChunkLoad } from "./wait-for-chunk-load.js";
import { replayCraftSkinDB } from "../classes/subscriptions/world-initialize.js";
import { removeEntities } from "./remove-entities.js";
import { debugError, debugLog } from "../data/util/debug.js";
import { findLastRecordedTick } from "../data/util/resolver.js";

export async function loadEntity(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        debugError(`No session found for player ${player.name}`);
        return;
    }

    const posData = session.replayPositionDataMap.get(player.id);
    const rotData = session.replayRotationDataMap.get(player.id);

    if (!posData || !rotData || posData.positions.size === 0) {
        debugError(`Replay data missing for player ${player.name}`);
        return;
    }

    // Find the closest recorded tick ≤ targetFrameTick
    const posTick = findLastRecordedTick(posData.positions, session.targetFrameTick);
    const rotTick = findLastRecordedTick(rotData.rotations, session.targetFrameTick);

    if (posTick === null || rotTick === null) {
        debugError(`No valid position or rotation found for player ${player.name} at tick ${session.targetFrameTick}`);
        return;
    }

    const summonPos = posData.positions.get(posTick)!;
    const summonRot = rotData.rotations.get(rotTick)!;

    // Ensure chunk is loaded
    if (!isChunkLoaded(summonPos, player)) {
        debugLog(`Chunk not loaded for ${player.name}, teleporting...`);
        const success = player.tryTeleport(summonPos, { checkForBlocks: false });
        if (success) {
            await waitForChunkLoad(summonPos, player);
        } else {
            debugError(`Failed to teleport ${player.name} to load chunk at ${summonPos.x}, ${summonPos.y}, ${summonPos.z}`);
            return;
        }
    }

    // Now summon the entity
    let customEntity;
    try {
        removeEntities(player, true);

        let skinData = replayCraftSkinDB.get(player.id);
        if (!skinData) {
            debugError(`[ReplayCraft] Failed to retrieve skin data for ${player.id}, have they set a skin?`);
            skinData = "0,0";
        }

        const [skinIDStr, modelIDStr] = skinData.split(",");
        const skinID = parseInt(skinIDStr);
        const modelID = parseInt(modelIDStr);

        const entityType = modelID === 0 ? ("dbg:replayentity_steve" as VanillaEntityIdentifier) : ("dbg:replayentity_alex" as VanillaEntityIdentifier);

        customEntity = player.dimension.spawnEntity(entityType, summonPos);
        if (!customEntity) {
            debugError(`[ReplayCraft] Failed to spawn entity for player ${player.name}`);
            return;
        }

        customEntity.setRotation(summonRot);
        customEntity.addTag("owner:" + player.id);
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
    } catch (error) {
        debugError(`Error spawning entity at ${summonPos.x}, ${summonPos.y}, ${summonPos.z}:`, error);
        return;
    }
}

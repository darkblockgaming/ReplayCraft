import { beforeChatSend } from "./replay/classes/subscriptions/chat-send-before-event";
import { replaycraftBreakBlockAfterEvent } from "./replay/classes/subscriptions/player-break-block-after-event";
import { replaycraftBreakBlockBeforeEvent } from "./replay/classes/subscriptions/player-break-block-before-event";
import { replaycraftInteractWithBlockAfterEvent } from "./replay/classes/subscriptions/player-interact-with-block-after-event";
import { replaycraftInteractWithBlockBeforeEvent } from "./replay/classes/subscriptions/player-interact-with-block-before-event";
import { replaycraftItemUseAfterEvent } from "./replay/classes/subscriptions/player-item-use-after-event";
import { replaycraftPlaceBlockBeforeEvent } from "./replay/classes/subscriptions/player-place-block-before-event";
import { replaycraftPlaceBlockAfterEvent } from "./replay/classes/subscriptions/player-place-block-after-event";
import { BlockPermutation, EasingType, Entity, EquipmentSlot, Player, system, VanillaEntityIdentifier, world } from "@minecraft/server";
import { clearStructure } from "./replay/functions/clear-structure";
import { playBlockSound } from "./replay/functions/play-block-sound";
import { onPlayerSpawn } from "./replay/classes/subscriptions/player-spawn-after-event";
import { onPlayerLeave } from "./replay/classes/subscriptions/player-leave-after-event";
import { subscribeToWorldInitialize } from "./replay/classes/subscriptions/world-initialize";
import { onEntityHurt } from "./replay/classes/subscriptions/entity-hurt";
//temp solution for the missing import this needs to be converted.
import "./cinematic/cinematic.js";
import { removeEntities } from "./replay/functions/remove-entities";
import config from "./replay/data/util/config";
import { replaySessions } from "./replay/data/replay-player-session";
import { BlockData, PlayerEquipmentData } from "./replay/classes/types/types";
import { removeOwnedAmbientEntities } from "./replay/entity/remove-ambient-entities";
import { debugLog, debugWarn } from "./replay/data/util/debug";
import { getRiddenEntity, isPlayerRiding } from "./replay/entity/is-riding";
import { isPlayerCrawling } from "./replay/entity/is-crawling";
import { calculateFallRatio } from "./replay/entity/transistion";
import { updateTrackedPlayers } from "./replay/multiplayer/tracked-players";
import { summonReplayEntity } from "./replay/functions/summon-replay-entity";
import { cleanupReplayEntities } from "./replay/multiplayer/cleanup-replay-entities";
import { customCommands } from "./replay/commands/command-handler";
import { cloneComponentData } from "./replay/data/util/export-entity-components";
import { registerEntitySpawnHandler } from "./replay/classes/subscriptions/entity-spawn-after-event";
import { assignEntityComponents } from "./replay/entity/variant-trigger";
import { replayCraftItemReleaseAfterEvent } from "./replay/classes/subscriptions/item-release-use";
import { replayCraftItemStartAfterEvent } from "./replay/classes/subscriptions/item-start-use";
import { replayCraftItemCompleteUseAfterEvent } from "./replay/classes/subscriptions/item-complete-use";
import { replayCraftItemStopUseAfterEvent } from "./replay/classes/subscriptions/item-stop-use";
import { playItemAnimation } from "./replay/items/item-animation-playback";
import { getReplayEntityId } from "./replay/items/lookup-custom-items";
import { doSave } from "./replay/functions/replayControls/save-replay-recording";
import { doSaveReset } from "./replay/functions/replayControls/load-progress-and-reset";

/**
 * beforeChatSend(); - we have migrated to the new custom slash commands within the bedrock API.
 */

//Events
replaycraftBreakBlockAfterEvent();
replaycraftBreakBlockBeforeEvent();
replaycraftPlaceBlockBeforeEvent();
replaycraftPlaceBlockAfterEvent();
replaycraftInteractWithBlockBeforeEvent();
replaycraftInteractWithBlockAfterEvent();

// soon to be removed from the API!

replaycraftItemUseAfterEvent();
replayCraftItemReleaseAfterEvent();
replayCraftItemStartAfterEvent();
replayCraftItemCompleteUseAfterEvent();
replayCraftItemStopUseAfterEvent();
//Show the player a useful message for the first time they join!
onPlayerSpawn();
//Handle player leaving the game
onPlayerLeave();

//data-hive
subscribeToWorldInitialize();

onEntityHurt();
customCommands();
const MAP_MEMORY_LIMITS = {
    // ~5MB per map as a starting point. These can be adjusted as required.
    replayBlockStateMap: 5_000_000,
    replayBlockInteractionAfterMap: 5_000_000,
    replayRotationDataMap: 5_000_000,
    replayActionDataMap: 5_000_000,
    replayEntityDataMap: 5_000_000,
    playerDamageEventsMap: 5_000_000,
    playerItemUseDataMap: 5_000_000,

    /**
     * These maps will grow the most during recording.
     *
     * You can increase these limits if you have memory to spare.
     *
     * Notes:
     * - By default, a single addon is limited to ~250 MB.
     * - You can increase the default memory allowance in the BDS `server.properties` file.
     * - The scripting engine is limited to 2 GB across all addons, so keep this in mind when
     *   adjusting these values.
     */

    replayAmbientEntityMap: 5_000_000,
    replayPositionDataMap: 5_000_000,
    replayEquipmentDataMap: 5_000_000,
};
/**
 * Adjusting this interval can help balance performance and responsiveness.
 * A shorter interval means more frequent memory checks, which can catch memory issues sooner,
 * but adds a lot of overhead. A longer interval reduces overhead but may delay detection of memory issues.
 * The default of 1200 ticks (1 minute) is a reasonable starting point for most scenarios.
 */
const MEMORY_CHECK_INTERVAL = 1200;

//Single loop this now handles the playback and recording logic.
system.runInterval(() => {
    for (const session of replaySessions.playerSessions.values()) {
        const {
            replayStateMachine,
            currentTick,
            recordingEndTick,
            trackedPlayers,
            settingReplayType,
            replayBlockStateMap,
            replayBlockInteractionAfterMap,
            replayBlockInteractionBeforeMap,
            replayPositionDataMap,
            replayRotationDataMap,
            replayActionDataMap,
            replayEntityDataMap,
            replayEquipmentDataMap,
            playerDamageEventsMap,
            playerItemUseDataMap,
            replayAmbientEntityMap,
            isFollowCamActive,
            isTopDownFixedCamActive,
            isTopDownDynamicCamActive,
            cameraFocusPlayer,
            cameraAffectedPlayers,
            topDownCamHight,
        } = session;

        const state = replayStateMachine.state;
        const isView = state === "viewStartRep";
        const isPlayback = state === "recStartRep";
        const isRecording = state === "recPending";
        const isReplaying = isView || isPlayback;
        registerEntitySpawnHandler({
            trackedPlayers,
        });
        // --- Recording Timer ---
        if (isRecording) session.recordingEndTick++;

        // --- Handle End of Replay ---
        if (isView && currentTick >= recordingEndTick - 1) {
            replayStateMachine.setState("recSaved");
            trackedPlayers.forEach((player) => {
                session.isReplayActive = false;
                clearStructure(player, session);
                removeEntities(player, true);
                removeOwnedAmbientEntities(player);
                cleanupReplayEntities(session);
            });
            session.currentTick = 0;
        } else if (isPlayback && currentTick >= recordingEndTick - 1) {
            replayStateMachine.setState("recCompleted", session.showCameraSetupUI);
            session.showCameraSetupUI = false;
            trackedPlayers.forEach((player) => {
                session.isReplayActive = false;
                session.isFollowCamActive = false;
                session.isTopDownFixedCamActive = false;
                session.isTopDownDynamicCamActive = false;
                player.camera.clear();
                clearStructure(player, session);
                removeEntities(player, true);
                removeOwnedAmbientEntities(player);
                cleanupReplayEntities(session);
            });
            session.currentTick = 0;
        }

        // --- Block State Replay ---
        if (isReplaying && session.replayController) {
            const player = session.replayController;
            const dimension = world.getDimension(player.dimension.id);

            for (const playerId of session.allRecordedPlayerIds) {
                const customEntity = replayEntityDataMap.get(playerId)?.customEntity;

                // --- Block Placement (before map) ---
                const playerData = replayBlockStateMap.get(playerId);
                const blockData = playerData?.blockStateChanges[currentTick];

                if (blockData) {
                    const applyPermutation = (part: BlockData) => {
                        const block = dimension.getBlock(part.location);
                        block.setPermutation(BlockPermutation.resolve(part.typeId, part.states));
                    };

                    if ("lowerPart" in blockData && "upperPart" in blockData) {
                        applyPermutation(blockData.lowerPart);
                        applyPermutation(blockData.upperPart);
                    } else if ("thisPart" in blockData && "otherPart" in blockData) {
                        applyPermutation(blockData.thisPart);
                        applyPermutation(blockData.otherPart);
                    } else {
                        applyPermutation(blockData);

                        if (settingReplayType === 0 && customEntity) {
                            customEntity.playAnimation("animation.replayentity.attack");
                        }

                        playBlockSound(blockData, player);
                    }
                }

                // --- Block Interactions (after map) ---
                const interactionData = replayBlockInteractionAfterMap.get(playerId);
                const interactionBlock = interactionData?.blockSateAfterInteractions[currentTick];
                const beforeInteractionData = replayBlockInteractionBeforeMap.get(playerId);
                let beforeBlock = beforeInteractionData?.blockStateBeforeInteractions[currentTick];
                if (beforeBlock) {
                    // Handle multi-part entries
                    if ("lowerPart" in beforeBlock && "upperPart" in beforeBlock) {
                        beforeBlock = beforeBlock.lowerPart; // pick one part for sound
                    } else if ("thisPart" in beforeBlock && "otherPart" in beforeBlock) {
                        beforeBlock = beforeBlock.thisPart;
                    }
                    playBlockSound(beforeBlock as BlockData, player, true);
                }

                if (interactionBlock) {
                    const applyInteractionPermutation = (part: BlockData) => {
                        const block = dimension.getBlock(part.location);
                        block.setPermutation(BlockPermutation.resolve(part.typeId, part.states));
                    };

                    if ("lowerPart" in interactionBlock && "upperPart" in interactionBlock) {
                        applyInteractionPermutation(interactionBlock.lowerPart);
                        applyInteractionPermutation(interactionBlock.upperPart);
                    } else {
                        applyInteractionPermutation(interactionBlock);
                    }

                    if (settingReplayType === 0 && customEntity) {
                        customEntity.playAnimation("animation.replayentity.attack");
                    }

                    //Broken at present and on hold until I can test and fix it.
                    //playBlockSound(interactionBlock as BlockData, player, true);
                }
            }
        }

        // --- Position and Rotation Recording ---
        if (isRecording) {
            trackedPlayers.forEach((player) => {
                // Ensure replayPositionDataMap has entry for this player
                if (!replayPositionDataMap.has(player.id)) {
                    replayPositionDataMap.set(player.id, {
                        recordedPositions: [],
                        recordedVelocities: [], // Assuming you track this too
                    });
                }
                // Same for rotation map
                if (!replayRotationDataMap.has(player.id)) {
                    replayRotationDataMap.set(player.id, {
                        recordedRotations: [],
                    });
                }

                const pos = replayPositionDataMap.get(player.id);
                const rot = replayRotationDataMap.get(player.id);

                if (pos && rot) {
                    pos.recordedPositions.push(player.location);
                    rot.recordedRotations.push(player.getRotation());
                    pos.recordedVelocities.push(player.getVelocity());
                }
            });
        }

        // --- Multiplayer Player Tracking ---
        if (isRecording) {
            updateTrackedPlayers();
        }

        // --- Action Recording ---
        if (isRecording) {
            trackedPlayers.forEach((player) => {
                const data = replayActionDataMap.get(player.id);
                if (!data) return;
                data.isSneaking.push(player.isSneaking ? 1 : 0);
                if (config.devAnimations === true) {
                    data.isSleeping.push(player.isSleeping ? 1 : 0);
                    data.isClimbing.push(player.isClimbing ? 1 : 0);
                    data.isFalling.push(player.isFalling ? 1 : 0);
                    data.isFlying.push(player.isFlying ? 1 : 0);
                    data.isGliding.push(player.isGliding ? 1 : 0);
                    data.isSprinting.push(player.isSprinting ? 1 : 0);
                    data.isSwimming.push(player.isSwimming ? 1 : 0);
                    data.isRiding.push(isPlayerRiding(player) ? 1 : 0);
                    const ridden = getRiddenEntity(player);
                    data.ridingTypeId.push(ridden?.typeId ?? null);
                    data.isCrawling.push(isPlayerCrawling(player) ? 1 : 0);
                }
            });
        }

        if (isReplaying && settingReplayType === 0) {
            for (const playerId of session.allRecordedPlayerIds) {
                const joinData = session.trackedPlayerJoinTicks.get(playerId);
                if (!joinData) continue; // skip if missing

                const joinTick = joinData.joinTick;
                const tickOffset = session.currentTick - joinTick;

                if (tickOffset < 0) {
                    // Player hasn’t joined yet at this tick
                    continue;
                }

                const playerData = session.replayActionDataMap.get(playerId);
                const entityData = session.replayEntityDataMap.get(playerId);

                if (!playerData || !entityData || !entityData.customEntity || typeof entityData.customEntity !== "object") {
                    continue;
                }

                // Defensive check to make sure arrays have data for this tickOffset
                if (
                    typeof playerData.isSneaking !== "object" ||
                    !(tickOffset in playerData.isSneaking) ||
                    !(tickOffset in playerData.isFalling) ||
                    !(tickOffset in playerData.isClimbing) ||
                    !(tickOffset in playerData.isSprinting) ||
                    !(tickOffset in playerData.isFlying) ||
                    !(tickOffset in playerData.isGliding) ||
                    !(tickOffset in playerData.isSwimming) ||
                    !(tickOffset in playerData.isSleeping) ||
                    !(tickOffset in playerData.isRiding) ||
                    !(tickOffset in playerData.ridingTypeId)
                ) {
                    continue;
                }

                safeSet(entityData.customEntity, "isSneaking", playerData.isSneaking[tickOffset] === 1);
                safeSet(entityData.customEntity, "rc:is_falling", playerData.isFalling[tickOffset] === 1);
                safeSet(entityData.customEntity, "rc:is_climbing", playerData.isClimbing[tickOffset] === 1);
                safeSet(entityData.customEntity, "rc:is_sprinting", playerData.isSprinting[tickOffset] === 1);
                safeSet(entityData.customEntity, "rc:is_flying", playerData.isFlying[tickOffset] === 1);
                safeSet(entityData.customEntity, "rc:is_gliding", playerData.isGliding[tickOffset] === 1);
                safeSet(entityData.customEntity, "rc:is_swimming", playerData.isSwimming[tickOffset] === 1);

                if (playerData.isSwimming[tickOffset]) {
                    const val = Number(entityData.customEntity.getProperty("rc:swim_amt") ?? 0.0);
                    const target = 1.0;
                    const speed = 0.1;
                    const nextVal = val + (target - val) * speed;
                    safeSet(entityData.customEntity, "rc:swim_amt", Math.min(nextVal, 1.0));
                }

                safeSet(entityData.customEntity, "rc:is_sleeping", playerData.isSleeping[tickOffset] === 1);

                if (playerData.isSleeping[tickOffset] === 1) {
                    const bedBlock = entityData.customEntity.dimension.getBlock(entityData.customEntity.location);
                    if (bedBlock && bedBlock.typeId.includes("bed")) {
                        const direction = bedBlock.permutation.getState("direction");
                        switch (direction) {
                            case 0: // south
                                safeSet(entityData.customEntity, "rc:sleep_dir", 90); // north
                                break;
                            case 1: // west
                                safeSet(entityData.customEntity, "rc:sleep_dir", 0); // east
                                break;
                            case 2: // north
                                safeSet(entityData.customEntity, "rc:sleep_dir", 270); // south
                                break;
                            case 3: // east
                                safeSet(entityData.customEntity, "rc:sleep_dir", 180); // west
                                break;
                        }
                    }
                }

                safeSet(entityData.customEntity, "rc:is_riding", playerData.isRiding[tickOffset] === 1);

                if (playerData.isRiding[tickOffset]) {
                    const entityTypeArray = ["minecraft:minecart", "minecraft:boat", "minecraft:chest_boat", "minecraft:strider"];
                    const ridingEntity = playerData.ridingTypeId[tickOffset];
                    if (entityTypeArray.includes(ridingEntity)) {
                        safeSet(entityData.customEntity, "rc:riding_y_offset", -10.0);
                    } else {
                        safeSet(entityData.customEntity, "rc:riding_y_offset", 0.0);
                    }
                }
            }
        }

        // --- Ambient Entity Recording ---
        if (isRecording) {
            trackedPlayers.forEach((player) => {
                const dimension = world.getDimension(player.dimension.id);
                const nearbyEntities = dimension.getEntities({
                    location: player.location,
                    maxDistance: 16,
                    excludeTypes: ["minecraft:player", "dbg:replayentity_steve", "dbg:replayentity_alex", "dbg:rccampos"],
                });

                // Create per-player ambient entity map if missing
                let playerMap = session.replayAmbientEntityMap.get(player.id);
                if (!playerMap) {
                    playerMap = new Map();
                    session.replayAmbientEntityMap.set(player.id, playerMap);
                }

                const seenThisTick = new Set<string>();

                for (const entity of nearbyEntities) {
                    const id = entity.id;
                    const key = `entity:${id}`;
                    let isProjectileDetected = false;
                    if (entity.getComponent("minecraft:projectile")) {
                        isProjectileDetected = true;
                    }
                    let entry = playerMap.get(key);
                    if (!entry) {
                        entry = {
                            typeId: entity.typeId,
                            recordedData: {},
                            spawnTick: session.recordingEndTick,
                            despawnTick: null,
                            lastSeenTick: session.recordingEndTick,
                            id: entity.id,
                            entityComponents: [], // now contains type + values
                            wasSpawned: false,
                            isProjectile: isProjectileDetected,
                            velocity: entity.getVelocity(),
                        };

                        playerMap.set(key, entry);
                    }
                    // If no components recorded yet, store them now
                    if (!entry.entityComponents || entry.entityComponents.length === 0) {
                        entry.entityComponents = entity.getComponents().map((component) => {
                            /*Clone the data however this wont grab data that uses extra functions.
                             * so we add those below as and when needed.
                             **/

                            const clonedData = cloneComponentData(component) as Record<string, unknown>;

                            // Special case to extract the familes data via getTypeFamilies()
                            if (component.typeId === "minecraft:type_family" && typeof (component as any).getTypeFamilies === "function") {
                                try {
                                    clonedData.families = (component as any).getTypeFamilies();
                                } catch (e) {
                                    if (config.debugEnabled) {
                                        debugWarn(`Failed to get type families for ${entity.typeId}:`, e);
                                    }
                                }
                            }

                            return {
                                typeId: component.typeId,
                                componentData: clonedData,
                            };
                        });
                    }

                    entry.recordedData[session.recordingEndTick] = {
                        location: { ...entity.location },
                        rotation: entity.getRotation(),
                    };

                    entry.lastSeenTick = session.recordingEndTick;
                    seenThisTick.add(key);
                }

                for (const [key, data] of playerMap.entries()) {
                    if (!seenThisTick.has(key) && data.despawnTick === null) {
                        if (data.lastSeenTick !== session.recordingEndTick) {
                            data.despawnTick = session.recordingEndTick;
                        }
                    }
                }
            });
        }

        if (isReplaying && session.replayStateMachine.state !== "recSaved") {
            if (config.debugEntitySpawnEvents === true && config.debugTickData === true) {
                debugLog("Tick:", session.currentTick);
                debugLog("All player IDs:", session.allRecordedPlayerIds);
            }

            for (const playerId of session.allRecordedPlayerIds) {
                const joinData = session.trackedPlayerJoinTicks.get(playerId);
                if (!joinData) continue; // skip if missing
                const joinTick = joinData.joinTick;
                const entity = session.replayEntityDataMap.get(playerId)?.customEntity;
                if (config.debugEntitySpawnEvents === true) {
                    debugLog(`Checking ${playerId}: joinTick=${joinTick}, currentTick=${session.currentTick}, entity exists: ${!!entity}`);
                }
                if (session.currentTick === joinTick && !entity && session.currentTick <= session.recordingEndTick) {
                    if (config.debugEntitySpawnEvents === true) {
                        debugLog(`Spawning entity for ${playerId}`);
                    }

                    summonReplayEntity(session, session.replayController, playerId, joinData.name);
                }
            }
        }
        // --- Entity Positioning Playback ---
        if (isReplaying && settingReplayType === 0) {
            for (const playerId of session.allRecordedPlayerIds) {
                const joinData = session.trackedPlayerJoinTicks.get(playerId);
                if (!joinData) continue; // skip if missing
                const joinTick = joinData.joinTick;
                const pos = replayPositionDataMap.get(playerId);
                const rot = replayRotationDataMap.get(playerId);

                // --- entity check + respawn ---
                let entityWrapper = replayEntityDataMap.get(playerId);
                let entity = entityWrapper?.customEntity;

                if (!entity || !entity.isValid) {
                    if (!session.isReplayActive) continue;
                    if (config.debugEntityPlayback === true) {
                        debugWarn(`[ReplayCraft] Replay entity for ${playerId} missing or invalid, respawning...`);
                    }
                    summonReplayEntity(session, session.replayController, playerId); // respawn using existing session
                    entity = replayEntityDataMap.get(playerId)?.customEntity;

                    if (!entity) {
                        if (config.debugEntityPlayback === true) {
                            debugWarn(`[ReplayCraft] Failed to respawn entity for ${playerId}, skipping this tick.`);
                        }
                        continue; // don’t crash playback, just skip this tick
                    }
                }

                if (pos && rot) {
                    const tickOffset = session.currentTick - joinTick;

                    if (tickOffset >= 0 && tickOffset < pos.recordedPositions.length && tickOffset < rot.recordedRotations.length) {
                        const ratio = calculateFallRatio(pos.recordedVelocities[tickOffset]);
                        try {
                            entity.setProperty("rc:elytra_ratio", ratio);
                        } catch (e) {
                            if (config.debugEntityPlayback === true) {
                                debugWarn(`Failed to set elytra ratio for entity ${entity.id}:`, e);
                            }
                        }

                        try {
                            entity.teleport(pos.recordedPositions[tickOffset], {
                                rotation: rot.recordedRotations[tickOffset],
                            });
                        } catch (e) {
                            if (config.debugEntityPlayback === true) {
                                debugWarn(`Skipped teleport for removed entity: ${entity.id}`);
                            }
                        }
                    } else if (tickOffset >= 0) {
                        if (config.debugEntityPlayback === true) {
                            debugWarn(`[ReplayCraft] Tick ${session.currentTick} out of bounds for ${playerId} (tickOffset=${tickOffset}, posLen=${pos.recordedPositions.length}, rotLen=${rot.recordedRotations.length})`);
                        }
                    } else {
                        if (config.debugEntityPlayback === true) {
                            debugLog(`[ReplayCraft] Skipping movement for ${playerId} — joinTick ${joinTick} > currentTick ${session.currentTick}`);
                        }
                    }
                }
            }
        }

        // --- Ambient Entity Playback ---
        if (isReplaying && settingReplayType === 0) {
            trackedPlayers.forEach((player) => {
                //Skip Offline players.
                if (!player || !player.isValid) return;
                const dimension = player.dimension;
                const playerId = player.id;
                const ambientMap = session.replayAmbientEntityMap.get(playerId);
                if (!ambientMap) return;

                // CLEANUP STEP at replay start: remove entities spawned during recording
                if (currentTick === 0) {
                    debugLog(`Running cleanup for player ${player.name}...`);
                    for (const [id, data] of ambientMap.entries()) {
                        if (!id.startsWith("entity:")) continue;
                        if (config.debugEntityTracking === true) {
                            debugLog(`Cleanup checking entity ${id} with spawnTick ${data.spawnTick}`);
                        }

                        if (data.wasSpawned === false) {
                            if (config.debugEntityTracking === true) {
                                debugLog(`Skipping pre-existing entity ${id}`);
                            }

                            continue;
                        }

                        // Instead of relying on data.replayEntity, find entity in dimension directly
                        const numericId = id.replace("entity:", "");
                        const foundEntity = dimension.getEntities().find((e) => e.id === numericId);

                        if (foundEntity && foundEntity.isValid) {
                            try {
                                foundEntity.remove();
                                if (config.debugEntityTracking === true) {
                                    debugLog(`Removed spawned entity ${id} at replay start for player ${player.name}`);
                                }
                            } catch (err) {
                                if (config.debugEntityTracking === true) {
                                    debugWarn(`Failed to remove spawned entity ${id} at replay start for player ${player.name}:`, err);
                                }
                            }
                        } else {
                            if (config.debugEntityTracking === true) {
                                debugLog(`No valid entity found to remove for ${id}`);
                            }
                        }
                    }
                }

                for (const [id, data] of ambientMap.entries()) {
                    if (!id.startsWith("entity:")) continue;
                    if (data.typeId === "minecraft:item" || data.typeId === "minecraft:xp_orb") continue;
                    const tickData = data.recordedData[currentTick];

                    // Try to find existing entity by id in dimension if not assigned yet
                    if (!data.replayEntity) {
                        const numericId = id.replace("entity:", "");
                        const foundEntity = dimension.getEntities().find((e) => e.id === numericId);
                        if (foundEntity) {
                            data.replayEntity = foundEntity;
                            if (config.debugEntityTracking === true) {
                                debugLog(`Assigned existing entity ${id} to replayEntity for player ${player.name}`);
                            }
                        }
                    }

                    const entity = data.replayEntity;
                    const hasValidEntity = entity && entity.isValid;

                    // Spawn if no entity exists and we have tickData
                    if (!hasValidEntity && currentTick >= data.spawnTick && tickData) {
                        try {
                            let spawnedEntity;
                            if (data.isProjectile) {
                                if (currentTick === data.spawnTick) {
                                    // Special handling for projectiles
                                    //Some entities can not be summond so we use a lookup to return a custom copy that can be summoned.
                                    const replayId = getReplayEntityId(data.typeId);
                                    spawnedEntity = dimension.spawnEntity(replayId as VanillaEntityIdentifier, tickData.location);

                                    const projComp = spawnedEntity.getComponent("minecraft:projectile");
                                    if (projComp && data.velocity) {
                                        projComp.shoot(data.velocity);
                                    }

                                    spawnedEntity.addTag(`replay:${player.id}`);
                                    if (config.debugEntityTracking === true) {
                                        debugLog(`Spawned projectile ${id} with velocity ${JSON.stringify(data.velocity)} for player ${player.name}`);
                                    }
                                }
                            } else {
                                spawnedEntity = dimension.spawnEntity(data.typeId as VanillaEntityIdentifier, tickData.location);
                                spawnedEntity.teleport(tickData.location, { rotation: tickData.rotation });
                                spawnedEntity.addTag(`replay:${player.id}`);

                                if (data.entityComponents && data.entityComponents.length > 0) {
                                    debugLog(`Restoring ${data.entityComponents.length} components for entity ${id}`);

                                    for (const comp of data.entityComponents) {
                                        try {
                                            const entityComponent = spawnedEntity.getComponent(comp.typeId);
                                            if (!entityComponent) {
                                                if (config.debugEntityTracking === true) {
                                                    debugLog(`Component ${comp.typeId} not supported for ${id}, skipping`);
                                                }

                                                continue;
                                            }
                                            if (config.debugEntityTracking === true) {
                                                debugLog(`comp.componentData: ${JSON.stringify(comp.componentData, null, 2)}`);
                                            }

                                            assignEntityComponents(spawnedEntity, comp);
                                        } catch (err) {
                                            if (config.debugEntityTracking === true) {
                                                debugWarn(`Failed to apply component ${comp.typeId} to ${id}:`, err);
                                            }
                                        }
                                    }
                                } else {
                                    if (config.debugEntityTracking === true) {
                                        debugLog(`No components found to restore for entity ${id}`);
                                    }
                                }
                                if (config.debugEntityTracking === true) {
                                    debugLog(`Spawned ambient entity ${id} for player ${player.name} at tick ${currentTick}`);
                                }

                                data.replayEntity = spawnedEntity;
                            }
                        } catch (err) {
                            if (config.debugEntityTracking === true) {
                                debugWarn(`Failed to spawn ambient entity ${id} for player ${player.name}:`, err);
                            }
                        }
                    }

                    if (hasValidEntity && tickData && !data.isProjectile) {
                        try {
                            entity.teleport(tickData.location, { rotation: tickData.rotation });
                        } catch (err) {
                            if (config.debugEntityTracking === true) {
                                debugWarn(`Failed to move ambient entity ${id} for player ${player.name}:`, err);
                            }

                            data.replayEntity = undefined; // clear invalid reference
                        }
                    }

                    // Damage and despawn logic unchanged...
                    if (hasValidEntity && data.hurtTicks?.has(currentTick)) {
                        try {
                            const damageAmount = data.hurtTicks.get(currentTick);
                            if (damageAmount !== undefined) {
                                const customEntity = replayEntityDataMap.get(player.id)?.customEntity;
                                customEntity?.playAnimation("animation.replayentity.attack");
                                entity.applyDamage(damageAmount);
                            }
                        } catch (err) {
                            if (config.debugEntityTracking === true) {
                                debugWarn(`Failed to apply damage to ambient entity ${id} for player ${player.name}:`, err);
                            }

                            data.replayEntity = undefined;
                        }
                    }

                    if (hasValidEntity && data.despawnTick === currentTick && entity.hasTag(`replay:${player.id}`)) {
                        try {
                            entity.remove();
                            data.replayEntity = undefined;
                            if (config.debugEntityTracking === true) {
                                debugLog(`Despawned ambient entity ${id} for player ${player.name} at tick ${currentTick}`);
                            }
                        } catch (err) {
                            if (config.debugEntityTracking === true) {
                                debugWarn(`Failed to despawn ambient entity ${id} for player ${player.name}:`, err);
                            }
                        }
                    }
                }
            });
        }

        // --- Equipment Recording ---
        if (isRecording) {
            trackedPlayers.forEach((player) => {
                const playerData = replayEquipmentDataMap.get(player.id);
                if (!playerData) return;

                const eqComp = player.getComponent("minecraft:equippable");

                type EquipmentKey = keyof PlayerEquipmentData;

                const slots: { key: EquipmentKey; slot: EquipmentSlot }[] = [
                    { key: "weapon1", slot: EquipmentSlot.Mainhand },
                    { key: "weapon2", slot: EquipmentSlot.Offhand },
                    { key: "armor1", slot: EquipmentSlot.Head },
                    { key: "armor2", slot: EquipmentSlot.Chest },
                    { key: "armor3", slot: EquipmentSlot.Legs },
                    { key: "armor4", slot: EquipmentSlot.Feet },
                ];
                slots.forEach(({ key, slot }) => {
                    const current = eqComp.getEquipment(slot)?.typeId || "air";
                    const arr = playerData[key];

                    // only push if different from last recorded state
                    if (arr.length === 0 || arr[arr.length - 1].item !== current) {
                        arr.push({ tick: recordingEndTick, item: current });
                    }
                });
            });
        }
        // --- Equipment Playback ---
        /**
         * Re-equips recorded items (mainhand, offhand, and armor slots) for a replaying entity at the current tick offset.
         *
         * Due to limitations in the Minecraft Bedrock Edition scripting API:
         * - The `minecraft:equippable` component is only available on players, not on custom entities.
         * - The `minecraft:inventory` component does not currently support native methods to set item slots.
         *
         * Therefore, we rely on `runCommand` to apply `replaceitem` commands to the replay entity.
         * This allows setting the exact recorded equipment during playback, even though it is not ideal or performant.
         *
         * @param {Entity} entity - The replaying custom entity to apply the items to.
         * @param {Object} playerData - The replay data object for the player.
         * @param {number} tickOffset - The offset tick relative to when the player joined the session.
         * @example
         * // Replaces current items with recorded ones
         * entity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${playerData.weapon1[tickOffset]}`);
         */
        if (settingReplayType === 0) {
            session.allRecordedPlayerIds.forEach((playerId) => {
                if (isView || isPlayback) {
                    const playerData = replayEquipmentDataMap.get(playerId);
                    const entityData = replayEntityDataMap.get(playerId);
                    if (!playerData || !entityData) return;

                    try {
                        const entity = entityData.customEntity;
                        const joinData = session.trackedPlayerJoinTicks.get(playerId);
                        const joinTick = joinData.joinTick;
                        const tickOffset = session.currentTick - joinTick;

                        if (tickOffset < 0) {
                            if (config.debugEquipmentPlayback) {
                                debugLog("Haven't reached this player's join tick yet");
                            }
                            return;
                        }

                        // helper function: get last known value up to current tick
                        function getItem(arr: { tick: number; item: string }[]): string {
                            if (arr.length === 0) return "air";
                            // fast path: if last recorded tick <= tickOffset
                            if (arr[arr.length - 1].tick <= tickOffset) {
                                return arr[arr.length - 1].item;
                            }
                            // otherwise binary search for last entry <= tickOffset
                            let low = 0,
                                high = arr.length - 1,
                                result = "air";
                            while (low <= high) {
                                const mid = (low + high) >> 1;
                                if (arr[mid].tick <= tickOffset) {
                                    result = arr[mid].item;
                                    low = mid + 1;
                                } else {
                                    high = mid - 1;
                                }
                            }
                            return result;
                        }

                        entity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${getItem(playerData.weapon1)}`);
                        entity.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${getItem(playerData.weapon2)}`);
                        entity.runCommand(`replaceitem entity @s slot.armor.head 0 ${getItem(playerData.armor1)}`);
                        entity.runCommand(`replaceitem entity @s slot.armor.chest 0 ${getItem(playerData.armor2)}`);
                        entity.runCommand(`replaceitem entity @s slot.armor.legs 0 ${getItem(playerData.armor3)}`);
                        entity.runCommand(`replaceitem entity @s slot.armor.feet 0 ${getItem(playerData.armor4)}`);
                    } catch (e) {
                        if (config.debugEquipmentPlayback) {
                            debugWarn(`Skipped equipment update: Entity removed or invalid (${entityData?.customEntity?.id})`, e);
                        }
                    }
                }
            });
        }
        // --- Charge Item Playback ---
        if (settingReplayType === 0) {
            session.allRecordedPlayerIds.forEach((playerId) => {
                const playerItemUseData = playerItemUseDataMap.get(playerId);
                if (!playerItemUseData) return;

                const attackerEntity = replayEntityDataMap.get(playerId)?.customEntity;
                if (!attackerEntity) return;

                playerItemUseData.forEach((event) => {
                    const startTick = event.trackingTick;
                    const endTick = event.endTime;

                    // While charging
                    if (currentTick >= startTick && currentTick < endTick) {
                        const elapsed = currentTick - startTick;
                        const progress = Math.min(elapsed / event.chargeTime, 1);
                        attackerEntity.setProperty("rc:holding_chargeable_item", true);
                        attackerEntity.setProperty("rc:item_use_duration", event.chargeTime);
                        //Call custom animation function
                        playItemAnimation(attackerEntity, event.typeId, progress);
                    }

                    // At release
                    if (currentTick === endTick) {
                        //restore vanilla item to mainhand
                        attackerEntity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${event.typeId} 1`);
                        attackerEntity.setProperty("rc:holding_chargeable_item", false);
                        attackerEntity.setProperty("rc:item_use_duration", 0);
                    }
                });
            });
        }

        // --- Entity Hurt Event Playback ---
        /**
         */
        if (settingReplayType === 0) {
            session.allRecordedPlayerIds.forEach((playerId) => {
                const playerDamageEvents = playerDamageEventsMap.get(playerId);
                if (!playerDamageEvents) return;

                const eventsThisTick = playerDamageEvents.filter((e) => e.hurtTick === currentTick);
                if (eventsThisTick.length === 0) return;

                eventsThisTick.forEach((event) => {
                    const attackerEntity = replayEntityDataMap.get(event.playerID)?.customEntity;
                    const victimEntity = replayEntityDataMap.get(event.VictimID)?.customEntity;

                    if (!attackerEntity || !victimEntity) return;

                    if (event.attackerTypeId !== "minecraft:player") {
                        victimEntity.applyDamage(event.DamageDealt);
                        // Debug
                        if (config.debugEntityHurtPlayback === true) {
                            debugLog(`[ReplayCraft DEBUG] Replayed hit: ${event.playerName} -> ${event.VictimName} for ${event.DamageDealt}`);
                        }
                        return;
                    }

                    try {
                        // Play victim hurt animation
                        switch (event.Weapon) {
                            case "minecraft:iron_sword":
                                attackerEntity.playAnimation("animation.replayentity.attack");
                        }
                        victimEntity.applyDamage(event.DamageDealt);

                        // Debug
                        if (config.debugEntityHurtPlayback === true) {
                            debugLog(`[ReplayCraft DEBUG] Replayed hit: ${event.playerName} -> ${event.VictimName} for ${event.DamageDealt}`);
                        }
                    } catch (e) {
                        if (config.debugEntityHurtPlayback === true) {
                            debugWarn("Entity Hurt Playback error", e);
                        }
                    }
                });
            });
        }

        // --- Camera Updates ---
        if (cameraFocusPlayer && isReplaying) {
            const entityData = replayEntityDataMap.get(cameraFocusPlayer.id);
            if (!entityData || !entityData.customEntity) return;

            let baseLocation, baseRotation;
            try {
                baseLocation = entityData.customEntity.location;
                baseRotation = entityData.customEntity.getRotation();
            } catch (e) {
                if (config.debugCameraUpdates === true) {
                    debugWarn(`[ReplayCraft DEBUG] Camera focus entity invalid or removed`);
                }

                return;
            }

            if (isFollowCamActive) {
                cameraAffectedPlayers.forEach((player) => {
                    const location = {
                        x: baseLocation.x,
                        y: baseLocation.y + 1.5,
                        z: baseLocation.z,
                    };
                    player.camera.setCamera("minecraft:free", {
                        facingLocation: location,
                        easeOptions: { easeTime: 0.4, easeType: EasingType.Linear },
                    });
                });
            }

            if (isTopDownFixedCamActive) {
                cameraAffectedPlayers.forEach((player) => {
                    const location = {
                        x: baseLocation.x,
                        y: baseLocation.y + topDownCamHight,
                        z: baseLocation.z,
                    };
                    player.camera.setCamera("minecraft:free", {
                        location,
                        rotation: { x: 90, y: 0 },
                        easeOptions: { easeTime: 0.4, easeType: EasingType.Linear },
                    });
                });
            }

            if (isTopDownDynamicCamActive) {
                cameraAffectedPlayers.forEach((player) => {
                    const location = {
                        x: baseLocation.x,
                        y: baseLocation.y + topDownCamHight,
                        z: baseLocation.z,
                    };
                    const rotation = { x: 90, y: baseRotation.y };
                    player.camera.setCamera("minecraft:free", {
                        location,
                        rotation,
                        easeOptions: { easeTime: 0.4, easeType: EasingType.Linear },
                    });
                });
            }
        }

        if (isRecording) {
            const allMaps = {
                replayBlockStateMap,
                replayBlockInteractionAfterMap,
                replayPositionDataMap,
                replayRotationDataMap,
                replayActionDataMap,
                replayEntityDataMap,
                replayEquipmentDataMap,
                playerDamageEventsMap,
                playerItemUseDataMap,
                replayAmbientEntityMap,
            };

            // Optionally, only run every N ticks
            if (recordingEndTick % MEMORY_CHECK_INTERVAL === 0) {
                checkMapMemoryLimits(allMaps, session.replayController);
            }
        }
        // --- Advance Tick ---
        if (isReplaying) session.currentTick++;

        // --- Playback HUD Updates ---
        if (isReplaying && session.playbackHUD.isVisible) {
            const currentSec = (session.currentTick / 20).toFixed(1);
            const totalSec = (session.recordingEndTick / 20).toFixed(1);

            let camInfo = "";
            if (session.currentCamTransitionData) {
                const { fromIndex, toIndex, endTick, easeTime, speedBPS } = session.currentCamTransitionData;
                const ticksRemaining = Math.max(0, endTick - session.currentTick);
                const secsRemaining = (ticksRemaining / 20).toFixed(1);

                // Find next point index (if exists)
                const nextIndex = toIndex + 1 < session.replayCamPos.length ? toIndex + 1 : null;

                if (session.playbackHUD.compactMode) {
                    camInfo = ` | P${fromIndex}→P${toIndex} ${secsRemaining}s/${easeTime.toFixed(1)}s (${speedBPS?.toFixed(1)} B/s)` + (nextIndex !== null ? ` | Next: P${nextIndex}` : "");
                } else {
                    camInfo = `Camera Transition\nFrom: P${fromIndex}\nTo: P${toIndex}\nTime: ${secsRemaining}s / ${easeTime.toFixed(1)}s\nSpeed: ${speedBPS?.toFixed(1)} B/s` + (nextIndex !== null ? `\nNext: P${nextIndex}` : "");
                }
            }

            switch (session.playbackHUD.elementToUse) {
                case 0:
                    session.replayController.onScreenDisplay.setActionBar(`${currentSec}s / ${totalSec}s${camInfo}`);
                    break;
                case 1:
                    session.replayController.onScreenDisplay.setTitle(`${currentSec}s / ${totalSec}s${camInfo}`);
                    break;
            }
        }
    }
}, 1);

export function safeSet(entity: Entity & { setProperty?: (id: string, value: boolean | number | string) => void }, key: string, value: boolean | number | string): void {
    try {
        if (key === "isSneaking") {
            // This cast is necessary since `isSneaking` may not be in the base Entity type
            (entity as any).isSneaking = value;
        } else {
            entity.setProperty?.(key, value);
        }
    } catch (e) {
        if (config.debugSafeSet === true) {
            debugWarn(`Skipped setting ${key} on removed entity: ${(entity as any)?.id}`);
        }
    }
}

function estimateMapMemory(map: Map<any, any>): number {
    let total = 0;
    // Rough approximation: sum JSON string lengths of values
    for (const value of map.values()) {
        total += JSON.stringify(value).length;
    }
    if (config.debugLogMemoryUsage) {
        debugLog(`[ReplayCraft DEBUG] Estimated memory for map: ${total} bytes`);
    }

    return total;
}

function checkMapMemoryLimits(maps: Record<string, Map<any, any>>, player: any) {
    for (const [name, map] of Object.entries(maps)) {
        const memoryUsage = estimateMapMemory(map);
        if (config.debugLogMemoryUsage) {
            debugLog(`[ReplayCraft DEBUG] ${name}: entries=${map.size}, approxMemory=${memoryUsage} bytes`);
        }

        if (memoryUsage >= MAP_MEMORY_LIMITS[name as keyof typeof MAP_MEMORY_LIMITS]) {
            stopRecording(name, player);
            return true; // stop early if any map exceeds limit
        }
    }
    return false;
}

function stopRecording(mapName: string, player: Player) {
    //call doSave
    doSave(player);
    // Send in-game message to player
    player.sendMessage(`§f§4[ReplayCraft]§f Recording stopped: ${mapName} exceeded memory limit. Your replay has been saved. and you will need to start a new recording.`);
    //reset and build the structure
    doSaveReset(player);
}

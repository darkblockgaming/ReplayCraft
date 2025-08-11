import { beforeChatSend } from "./classes/subscriptions/chat-send-before-event";
import { replaycraftBreakBlockAfterEvent } from "./classes/subscriptions/player-break-block-after-event";
import { replaycraftBreakBlockBeforeEvent } from "./classes/subscriptions/player-break-block-before-event";
import { replaycraftInteractWithBlockAfterEvent } from "./classes/subscriptions/player-interact-with-block-after-event";
import { replaycraftInteractWithBlockBeforeEvent } from "./classes/subscriptions/player-interact-with-block-before-event";
import { replaycraftItemUseAfterEvent } from "./classes/subscriptions/player-item-use-after-event";
import { replaycraftPlaceBlockBeforeEvent } from "./classes/subscriptions/player-place-block-before-event";
import { replaycraftPlaceBlockAfterEvent } from "./classes/subscriptions/player-place-block-after-event";
import { BlockPermutation, EasingType, Entity, EquipmentSlot, system, VanillaEntityIdentifier, world } from "@minecraft/server";
import { clearStructure } from "./functions/clear-structure";
import { playBlockSound } from "./functions/play-block-sound";
import { onPlayerSpawn } from "./classes/subscriptions/player-spawn-after-event";
import { onPlayerLeave } from "./classes/subscriptions/player-leave-after-event";
import { subscribeToWorldInitialize } from "./classes/subscriptions/world-initialize";
import { onEntityHurt } from "./classes/subscriptions/entity-hurt";
//temp solution for the missing import this needs to be convered.
import "./ReplayCraft.js";
import { removeEntities } from "./functions/remove-entities";
import config from "./data/util/config";
import { replaySessions } from "./data/replay-player-session";
import { BlockData, RecordedEntityComponent } from "./classes/types/types";
import { removeOwnedAmbientEntities } from "./entity/remove-ambient-entities";
import { debugLog, debugWarn } from "./data/util/debug";
import { getRiddenEntity, isPlayerRiding } from "./entity/is-riding";
import { isPlayerCrawling } from "./entity/is-crawling";
import { calculateFallRatio } from "./entity/transistion";
import { updateTrackedPlayers } from "./multiplayer/tracked-players";
import { summonReplayEntity } from "./functions/summon-replay-entity";
import { cleanupReplayEntities } from "./multiplayer/cleanup-replay-entities";
import { customCommands } from "./commands/command-handler";
import { cloneComponentData } from "./data/util/export-entity-components";
import { registerEntitySpawnHandler } from "./classes/subscriptions/entity-spawn-after-event";

//Chat events
beforeChatSend();
//Events
replaycraftBreakBlockAfterEvent();
replaycraftBreakBlockBeforeEvent();
replaycraftPlaceBlockBeforeEvent();
replaycraftPlaceBlockAfterEvent();
replaycraftInteractWithBlockBeforeEvent();
replaycraftInteractWithBlockAfterEvent();
// soon to be removed from the API!
replaycraftItemUseAfterEvent();

//Show the player a useful message for the first time they join!
onPlayerSpawn();
//Handle player leaving the game
onPlayerLeave();

//data-hive
subscribeToWorldInitialize();

onEntityHurt();
customCommands();

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
            replayPositionDataMap,
            replayRotationDataMap,
            replayActionDataMap,
            replayEntityDataMap,
            replayEquipmentDataMap,
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

                    playBlockSound(blockData, player, true);
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
                const joinTick = session.trackedPlayerJoinTicks.get(playerId) ?? 0;
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

                    let entry = playerMap.get(key);
                    if (!entry) {
                        // Gather all components with their current values
                        const components: RecordedEntityComponent[] = entity.getComponents().map((component) => {
                            const componentData = cloneComponentData(component) as Record<string, unknown>;
                            return {
                                typeId: component.typeId,
                                componentData,
                            };
                        });

                        entry = {
                            typeId: entity.typeId,
                            recordedData: {},
                            spawnTick: session.recordingEndTick,
                            despawnTick: null,
                            lastSeenTick: session.recordingEndTick,
                            id: entity.id,
                            entityComponents: components, // now contains type + values
                            wasSpawned: false,
                        };

                        playerMap.set(key, entry);
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
            debugLog("Tick:", session.currentTick);
            debugLog("All player IDs:", session.allRecordedPlayerIds);

            for (const playerId of session.allRecordedPlayerIds) {
                const joinTick = session.trackedPlayerJoinTicks.get(playerId) ?? 0;
                const entity = session.replayEntityDataMap.get(playerId)?.customEntity;

                debugLog(`Checking ${playerId}: joinTick=${joinTick}, currentTick=${session.currentTick}, entity exists: ${!!entity}`);

                if (session.currentTick === joinTick && !entity && session.currentTick <= session.recordingEndTick) {
                    debugLog(`Spawning entity for ${playerId}`);
                    summonReplayEntity(session, session.replayController, playerId);
                }
            }
        }
        // --- Entity Positioning Playback ---
        if (isReplaying && settingReplayType === 0) {
            for (const playerId of session.allRecordedPlayerIds) {
                const joinTick = session.trackedPlayerJoinTicks.get(playerId) ?? 0;
                const pos = replayPositionDataMap.get(playerId);
                const rot = replayRotationDataMap.get(playerId);
                const entity = replayEntityDataMap.get(playerId)?.customEntity;

                if (pos && rot && entity) {
                    const tickOffset = session.currentTick - joinTick;

                    if (tickOffset >= 0 && tickOffset < pos.recordedPositions.length && tickOffset < rot.recordedRotations.length) {
                        const ratio = calculateFallRatio(pos.recordedVelocities[tickOffset]);
                        try {
                            entity.setProperty("rc:elytra_ratio", ratio);
                        } catch (e) {
                            debugWarn(`Failed to set elytra ratio for entity ${entity.id}:`, e);
                        }

                        try {
                            entity.teleport(pos.recordedPositions[tickOffset], {
                                rotation: rot.recordedRotations[tickOffset],
                            });
                        } catch (e) {
                            debugWarn(`Skipped teleport for removed entity: ${entity.id}`);
                        }
                    } else if (tickOffset >= 0) {
                        // Only log out-of-bounds if we expected to be within range
                        debugWarn(`[ReplayCraft] Tick ${session.currentTick} out of bounds for ${playerId} (tickOffset=${tickOffset}, posLen=${pos.recordedPositions.length}, rotLen=${rot.recordedRotations.length})`);
                    } else {
                        // Optional: early skip logging
                        debugLog(`[ReplayCraft] Skipping movement for ${playerId} — joinTick ${joinTick} > currentTick ${session.currentTick}`);
                    }
                }
            }
        }

        // --- Ambient Entity Playback ---
        if (isReplaying && settingReplayType === 0) {
            trackedPlayers.forEach((player) => {
                const dimension = player.dimension;
                const playerId = player.id;
                const ambientMap = session.replayAmbientEntityMap.get(playerId);
                if (!ambientMap) return;

                // CLEANUP STEP at replay start: remove entities spawned during recording
                if (currentTick === 0) {
                    debugLog(`Running cleanup for player ${player.name}...`);
                    for (const [id, data] of ambientMap.entries()) {
                        if (!id.startsWith("entity:")) continue;
                        debugLog(`Cleanup checking entity ${id} with spawnTick ${data.spawnTick}`);

                        if (data.wasSpawned === false) {
                            debugLog(`Skipping pre-existing entity ${id}`);
                            continue;
                        }

                        // Instead of relying on data.replayEntity, find entity in dimension directly
                        const numericId = id.replace("entity:", "");
                        const foundEntity = dimension.getEntities().find((e) => e.id === numericId);

                        if (foundEntity && foundEntity.isValid) {
                            try {
                                foundEntity.remove();
                                debugLog(`Removed spawned entity ${id} at replay start for player ${player.name}`);
                            } catch (err) {
                                debugWarn(`Failed to remove spawned entity ${id} at replay start for player ${player.name}:`, err);
                            }
                        } else {
                            debugLog(`No valid entity found to remove for ${id}`);
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
                            debugLog(`Assigned existing entity ${id} to replayEntity for player ${player.name}`);
                        }
                    }

                    const entity = data.replayEntity;
                    const hasValidEntity = entity && entity.isValid;

                    // Spawn if no entity exists and we have tickData
                    if (!hasValidEntity && currentTick >= data.spawnTick && tickData) {
                        try {
                            const spawnedEntity = dimension.spawnEntity(data.typeId as VanillaEntityIdentifier, tickData.location);
                            spawnedEntity.teleport(tickData.location, { rotation: tickData.rotation });
                            spawnedEntity.addTag(`replay:${player.id}`);
                            debugLog(`Spawned ambient entity ${id} for player ${player.name} at tick ${currentTick}`);
                            data.replayEntity = spawnedEntity;
                        } catch (err) {
                            debugWarn(`Failed to spawn ambient entity ${id} for player ${player.name}:`, err);
                        }
                    }

                    if (hasValidEntity && tickData) {
                        try {
                            entity.teleport(tickData.location, { rotation: tickData.rotation });
                        } catch (err) {
                            debugWarn(`Failed to move ambient entity ${id} for player ${player.name}:`, err);
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
                            debugWarn(`Failed to apply damage to ambient entity ${id} for player ${player.name}:`, err);
                            data.replayEntity = undefined;
                        }
                    }

                    if (hasValidEntity && data.despawnTick === currentTick && entity.hasTag(`replay:${player.id}`)) {
                        try {
                            entity.remove();
                            data.replayEntity = undefined;
                            debugLog(`Despawned ambient entity ${id} for player ${player.name} at tick ${currentTick}`);
                        } catch (err) {
                            debugWarn(`Failed to despawn ambient entity ${id} for player ${player.name}:`, err);
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
                playerData.weapon1.push(eqComp.getEquipment(EquipmentSlot.Mainhand)?.typeId || "air");
                playerData.weapon2.push(eqComp.getEquipment(EquipmentSlot.Offhand)?.typeId || "air");
                playerData.armor1.push(eqComp.getEquipment(EquipmentSlot.Head)?.typeId || "air");
                playerData.armor2.push(eqComp.getEquipment(EquipmentSlot.Chest)?.typeId || "air");
                playerData.armor3.push(eqComp.getEquipment(EquipmentSlot.Legs)?.typeId || "air");
                playerData.armor4.push(eqComp.getEquipment(EquipmentSlot.Feet)?.typeId || "air");
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
                        const joinTick = session.trackedPlayerJoinTicks.get(playerId) ?? 0;
                        const tickOffset = session.currentTick - joinTick;
                        if (tickOffset < 0) {
                            console.log("Haven't reached this player's join tick yet");
                            return; // Haven't reached this player's join tick yet
                        }
                        if (tickOffset >= playerData.weapon1.length) {
                            console.log("Out of recorded data range");
                            return; // Out of recorded data range
                        }
                        entity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${playerData.weapon1[tickOffset]}`);
                        entity.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${playerData.weapon2[tickOffset]}`);
                        entity.runCommand(`replaceitem entity @s slot.armor.head 0 ${playerData.armor1[tickOffset]}`);
                        entity.runCommand(`replaceitem entity @s slot.armor.chest 0 ${playerData.armor2[tickOffset]}`);
                        entity.runCommand(`replaceitem entity @s slot.armor.legs 0 ${playerData.armor3[tickOffset]}`);
                        entity.runCommand(`replaceitem entity @s slot.armor.feet 0 ${playerData.armor4[tickOffset]}`);
                    } catch (e) {
                        debugWarn(` Skipped equipment update: Entity removed or invalid (${entityData?.customEntity?.id})`, e);
                    }
                }
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
                debugWarn(`[Scripting] Camera focus entity invalid or removed`);
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

        // --- Advance Tick ---
        if (isReplaying) session.currentTick++;
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
        debugWarn(`Skipped setting ${key} on removed entity: ${(entity as any)?.id}`);
    }
}

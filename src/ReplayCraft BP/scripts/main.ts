import { beforeChatSend } from "./classes/subscriptions/chat-send-before-event";
import { replaycraftBreakBlockAfterEvent } from "./classes/subscriptions/player-break-block-after-event";
import { replaycraftBreakBlockBeforeEvent } from "./classes/subscriptions/player-break-block-before-event";
import { replaycraftInteractWithBlockAfterEvent } from "./classes/subscriptions/player-interact-with-block-after-event";
import { replaycraftInteractWithBlockBeforeEvent } from "./classes/subscriptions/player-interact-with-block-before-event";
import { replaycraftItemUseAfterEvent } from "./classes/subscriptions/player-item-use-after-event";
import { replaycraftPlaceBlockBeforeEvent } from "./classes/subscriptions/player-place-block-before-event";
import { replaycraftPlaceBlockAfterEvent } from "./classes/subscriptions/player-place-block-after-event";
import { BlockPermutation, EasingType, Entity, EquipmentSlot, ItemStack, system, VanillaEntityIdentifier, world } from "@minecraft/server";
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
import { BlockData } from "./classes/types/types";
import { removeOwnedAmbientEntities } from "./entity/remove-ambient-entities";
import { debugLog, debugWarn } from "./data/util/debug";
import { getRiddenEntity, isPlayerRiding } from "./entity/is-riding";
import { isPlayerCrawling } from "./entity/is-crawling";
import { calculateFallRatio } from "./entity/transistion";

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

        // --- Recording Timer ---
        if (isRecording) session.recordingEndTick++;

        // --- Handle End of Replay ---
        if (isView && currentTick >= recordingEndTick - 1) {
            replayStateMachine.setState("recSaved");
            trackedPlayers.forEach((player) => {
                session.isReplayActive = false;
                clearStructure(player);
                removeEntities(player, true);
                removeOwnedAmbientEntities(player);
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
                clearStructure(player);
                removeEntities(player, true);
                removeOwnedAmbientEntities(player);
            });
            session.currentTick = 0;
        }

        // --- Block State Replay ---
        if (isReplaying) {
            trackedPlayers.forEach((player) => {
                const dimension = world.getDimension(player.dimension.id);
                const customEntity = replayEntityDataMap.get(player.id)?.customEntity;

                // Block placement before map
                const playerData = replayBlockStateMap.get(player.id);
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

                // Block break/interactions after map
                const interactionData = replayBlockInteractionAfterMap.get(player.id);
                const interactionBlock = interactionData?.blockSateAfterInteractions[currentTick];

                if (interactionBlock) {
                    const interactionDimension = world.getDimension(player.dimension.id);

                    const applyInteractionPermutation = (part: BlockData) => {
                        const block = interactionDimension.getBlock(part.location);
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
            });
        }

        // --- Position and Rotation Recording ---
        if (isRecording) {
            trackedPlayers.forEach((player) => {
                const pos = replayPositionDataMap.get(player.id);
                const rot = replayRotationDataMap.get(player.id);
                if (pos && rot) {
                    pos.recordedPositions.push(player.location);
                    rot.recordedRotations.push(player.getRotation());
                    pos.recordedVelocities.push(player.getVelocity());
                }
            });
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

        // --- Animation + Action Playback ---
        if (isReplaying && settingReplayType === 0) {
            trackedPlayers.forEach((player) => {
                const playerData = session.replayActionDataMap.get(player.id);
                const entityData = session.replayEntityDataMap.get(player.id);
                if (!playerData || !entityData || !entityData.customEntity || typeof entityData.customEntity !== "object" || typeof playerData.isSneaking !== "object" || !(session.currentTick in playerData.isSneaking)) {
                    return;
                }

                safeSet(entityData.customEntity, "isSneaking", playerData.isSneaking[session.currentTick] === 1);
                safeSet(entityData.customEntity, "rc:is_falling", playerData.isFalling[session.currentTick] === 1);
                safeSet(entityData.customEntity, "rc:is_climbing", playerData.isClimbing[session.currentTick] === 1);
                safeSet(entityData.customEntity, "rc:is_sprinting", playerData.isSprinting[session.currentTick] === 1);
                safeSet(entityData.customEntity, "rc:is_flying", playerData.isFlying[session.currentTick] === 1);
                safeSet(entityData.customEntity, "rc:is_gliding", playerData.isGliding[session.currentTick] === 1);
                //Swimming
                safeSet(entityData.customEntity, "rc:is_swimming", playerData.isSwimming[session.currentTick] === 1);
                //Diving Logic
                if (playerData.isSwimming[session.currentTick]) {
                    const val = Number(entityData.customEntity.getProperty("rc:swim_amt") ?? 0.0);
                    const target = 1.0;
                    const speed = 0.1;
                    const nextVal = val + (target - val) * speed;
                    safeSet(entityData.customEntity, "rc:swim_amt", Math.min(nextVal, 1.0));
                }

                //Sleeping
                safeSet(entityData.customEntity, "rc:is_sleeping", playerData.isSleeping[session.currentTick] === 1);
                if (playerData.isSleeping[session.currentTick] === 1) {
                    const bedBlock = entityData.customEntity.dimension.getBlock(entityData.customEntity.location);
                    if (bedBlock && bedBlock.typeId.includes("bed")) {
                        const direction = bedBlock.permutation.getState("direction");
                        switch (direction) {
                            case 0: //south
                                safeSet(entityData.customEntity, "rc:sleep_dir", 90); //north
                                break;
                            case 1: //west
                                safeSet(entityData.customEntity, "rc:sleep_dir", 0); //east
                                break;
                            case 2: //north
                                safeSet(entityData.customEntity, "rc:sleep_dir", 270); //south
                                break;
                            case 3: //east
                                safeSet(entityData.customEntity, "rc:sleep_dir", 180); //west
                                break;
                        }
                    }
                }

                //Riding
                safeSet(entityData.customEntity, "rc:is_riding", playerData.isRiding[session.currentTick] === 1);
                if (playerData.isRiding[session.currentTick]) {
                    const entityTypeArray = ["minecraft:minecart", "minecraft:boat", "minecraft:chest_boat", "minecraft:strider"];
                    const ridingEntity = playerData.ridingTypeId[currentTick];
                    if (entityTypeArray.includes(ridingEntity)) {
                        safeSet(entityData.customEntity, "rc:riding_y_offset", -10.0);
                    } else {
                        safeSet(entityData.customEntity, "rc:riding_y_offset", 0.0);
                    }
                }
            });
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
                        entry = {
                            typeId: entity.typeId,
                            recordedData: {},
                            spawnTick: session.recordingEndTick,
                            despawnTick: null,
                            lastSeenTick: session.recordingEndTick,
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

        // --- Entity Positioning Playback ---
        if (isReplaying && settingReplayType === 0) {
            trackedPlayers.forEach((player) => {
                const pos = replayPositionDataMap.get(player.id);
                const rot = replayRotationDataMap.get(player.id);
                const entity = replayEntityDataMap.get(player.id)?.customEntity;
                if (pos && rot && entity) {
                    const ratio = calculateFallRatio(pos.recordedVelocities[currentTick]);
                    try {
                        entity.setProperty("rc:elytra_ratio", ratio);
                    } catch (e) {
                        debugWarn(`Failed to set elytra ratio for entity ${entity.id}:`, e);
                    }
                    try {
                        entity.teleport(pos.recordedPositions[currentTick], {
                            rotation: rot.recordedRotations[currentTick],
                        });
                    } catch (e) {
                        debugWarn(`Skipped teleport for removed entity: ${entity.id}`);
                    }
                }
            });
        }

        // --- Ambient Entity Playback ---
        if (isReplaying && settingReplayType === 0) {
            trackedPlayers.forEach((player) => {
                const dimension = player.dimension;
                const playerId = player.id;
                const ambientMap = session.replayAmbientEntityMap.get(playerId);
                if (!ambientMap) return;

                for (const [id, data] of ambientMap.entries()) {
                    if (!id.startsWith("entity:")) continue;
                    // Skip these specific entities
                    if (data.typeId === "minecraft:item" || data.typeId === "minecraft:xp_orb") continue;

                    const tickData = data.recordedData[currentTick];

                    // Spawn
                    if (currentTick >= data.spawnTick && !data.replayEntity && tickData) {
                        try {
                            const entity = dimension.spawnEntity(data.typeId as VanillaEntityIdentifier, tickData.location);
                            entity.teleport(tickData.location, { rotation: tickData.rotation });
                            // Tag with player ID to track ownership this is later used to despawn.
                            entity.addTag(`replay:${player.id}`);
                            if (config.debugEntityTracking) {
                                debugLog(`Spawned ambient entity ${id} for player ${player.name} at ${tickData.location}`);
                            }
                            data.replayEntity = entity;
                        } catch (err) {
                            debugWarn(`Failed to spawn ambient entity ${id} for player ${player.name}:`, err);
                        }
                    }

                    // Move
                    if (data.replayEntity && tickData) {
                        try {
                            if (!data.replayEntity.isValid) throw new Error("Entity no longer valid");
                            data.replayEntity.teleport(tickData.location, {
                                rotation: tickData.rotation,
                            });
                        } catch (err) {
                            debugWarn(`Failed to move ambient entity ${id} for player ${player.name}:`, err);
                            data.replayEntity = undefined; // cleanup dead reference
                        }
                    }

                    // Damage
                    if (data.replayEntity && data.hurtTicks?.has(currentTick)) {
                        try {
                            if (!data.replayEntity.isValid) throw new Error("Entity no longer valid");

                            const damageAmount = data.hurtTicks.get(currentTick);
                            if (damageAmount !== undefined) {
                                const customEntity = replayEntityDataMap.get(player.id)?.customEntity;
                                customEntity?.playAnimation("animation.replayentity.attack");
                                data.replayEntity.applyDamage(damageAmount);
                            }
                        } catch (err) {
                            debugWarn(`Failed to apply damage to ambient entity ${id} for player ${player.name}:`, err);
                            data.replayEntity = undefined;
                        }
                    }
                    // Despawn
                    if (data.replayEntity && data.despawnTick === currentTick) {
                        try {
                            data.replayEntity.kill();
                            data.replayEntity = undefined;
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
        if (settingReplayType === 0) {
            trackedPlayers.forEach((player) => {
                if (isView || isPlayback) {
                    const playerData = replayEquipmentDataMap.get(player.id);
                    const entityData = replayEntityDataMap.get(player.id);
                    try {
                        const entity = entityData.customEntity;
                        const tick = currentTick;
                        const equipmentComponent = entity.getComponent("minecraft:equippable");
                        equipmentComponent.setEquipment(EquipmentSlot.Mainhand, new ItemStack(playerData.weapon1[tick]));
                        equipmentComponent.setEquipment(EquipmentSlot.Offhand, new ItemStack(playerData.weapon2[tick]));
                        equipmentComponent.setEquipment(EquipmentSlot.Head, new ItemStack(playerData.armor1[tick]));
                        equipmentComponent.setEquipment(EquipmentSlot.Chest, new ItemStack(playerData.armor2[tick]));
                        equipmentComponent.setEquipment(EquipmentSlot.Legs, new ItemStack(playerData.armor3[tick]));
                        equipmentComponent.setEquipment(EquipmentSlot.Feet, new ItemStack(playerData.armor4[tick]));
                    } catch (e) {
                        debugWarn(` Skipped equipment update: Entity removed or invalid (${entityData?.customEntity?.id})`);
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

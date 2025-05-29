import { beforeChatSend } from "./classes/subscriptions/chatSendBeforeEvent";
import { replaycraftBreakBlockAfterEvent } from "./classes/subscriptions/playerBreakBlockAfterEvent";
import { replaycraftBreakBlockBeforeEvent } from "./classes/subscriptions/playerBreakBlockBeforeEvent";
import { replaycraftInteractWithBlockAfterEvent } from "./classes/subscriptions/playerInteractWithBlockAfterEvent";
import { replaycraftInteractWithBlockBeforeEvent } from "./classes/subscriptions/playerInteractWithBlockBeforeEvent";
import { replaycraftItemUseBeforeEvent } from "./classes/subscriptions/playerItemUseBeforeEvent";
import { replaycraftItemUseAfterEvent } from "./classes/subscriptions/playerItemUseAfterEvent";
import { replaycraftPlaceBlockBeforeEvent } from "./classes/subscriptions/playerPlaceBlockBeforeEvent";
import { replaycraftPlaceBlockAfterEvent } from "./classes/subscriptions/playerPlaceBlockAfterEvent";
import { BlockPermutation, EasingType, EquipmentSlot, Player, system, world } from "@minecraft/server";
import { clearStructure } from "./functions/clearStructure";
import { playBlockSound } from "./functions/playBlockSound";
import { onPlayerSpawn } from "./classes/subscriptions/player-spawn";
import { onPlayerLeave } from "./classes/subscriptions/player-leave";
import { subscribeToWorldInitialize } from "./classes/subscriptions/world-initialize";
//temp solution for the missing import this needs to be convered.
import "./ReplayCraft.js";
import { removeEntities } from "./functions/removeEntities";
import config from "./data/config";
import { SharedVariables } from "./data/replay-player-session";

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
replaycraftItemUseBeforeEvent();
replaycraftItemUseAfterEvent();

//Show the player a useful message for the first time they join!
onPlayerSpawn();
//Handle player leaving the game
onPlayerLeave();

//data-hive
subscribeToWorldInitialize();

//Timer for each frame?
system.runInterval(() => {
    // Iterate all player sessions
    for (const session of SharedVariables.playerSessions.values()) {
        if (session.replayStateMachine.state === "recPending") {
            session.dbgRecTime += 1;
        }
    }
}, 1);

/*
 * Handles replay playback for all active sessions.
 * When the replay reaches the end, sets the replay state to "recSaved"
 * Clears replay-related structures and entities for each player in the session
 * Resets the tick counter
 */
system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        if (session.replayStateMachine.state === "viewStartRep") {
            if (session.lilTick >= session.dbgRecTime - 1) {
                session.replayStateMachine.setState("recSaved");
                session.multiPlayers.forEach((player) => {
                    session.currentSwitch = false;
                    clearStructure(player);
                    removeEntities(player, true);
                });
                session.lilTick = 0;
                continue; // Move to next session
            }
            session.lilTick++;
        }
    }
}, 1);
/*
 * Manages active replay playback for all sessions in the "recStartRep" state.
 * When the replay reaches its end:
 * Finalizes the replay by setting state to "recCompleted" (optionally triggering UI update)
 * Resets various camera modes and clears player cameras
 * Cleans up replay structures and entities for each player
 * Resets the tick counter
 */
system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        if (session.replayStateMachine.state === "recStartRep") {
            if (session.lilTick >= session.dbgRecTime - 1) {
                if (session.showCameraSetupUI === true) {
                    session.replayStateMachine.setState("recCompleted", true);
                    session.showCameraSetupUI = false;
                } else {
                    session.replayStateMachine.setState("recCompleted");
                }

                session.multiPlayers.forEach((player) => {
                    session.followCamSwitch = false;
                    session.topDownCamSwitch = false;
                    session.topDownCamSwitch2 = false;
                    player.camera.clear();
                    session.currentSwitch = false;
                    clearStructure(player);
                    removeEntities(player, true);
                });

                session.lilTick = 0;
                continue; // go to next session
            }
            session.lilTick++;
        }
    }
}, 1);
/**
 * Runs every tick and iterates through each replay session in
 * SharedVariables.playerSessions. For each session, it iterates through the
 * session's players (multiPlayers) and updates blocks according to the recorded
 * block data for the current replay tick.
 */
system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        session.multiPlayers.forEach((player) => {
            if (session.replayStateMachine.state === "viewStartRep" || session.replayStateMachine.state === "recStartRep") {
                if (session.lilTick <= session.dbgRecTime) {
                    const playerData = session.replayBDataMap.get(player.id);
                    const customEntityWrapper = session.replayODataMap.get(player.id);
                    const customEntity = customEntityWrapper?.customEntity;
                    if (playerData && playerData.dbgBlockData[session.lilTick]) {
                        const blockData = playerData.dbgBlockData[session.lilTick];
                        const dimension = world.getDimension(player.dimension.id);

                        if (blockData.lowerPart && blockData.upperPart) {
                            const { lowerPart, upperPart } = blockData;
                            dimension.getBlock(lowerPart.location).setPermutation(BlockPermutation.resolve(lowerPart.typeId, lowerPart.states));
                            dimension.getBlock(upperPart.location).setPermutation(BlockPermutation.resolve(upperPart.typeId, upperPart.states));
                        } else if (blockData.thisPart && blockData.otherPart) {
                            const { thisPart, otherPart } = blockData;
                            dimension.getBlock(thisPart.location).setPermutation(BlockPermutation.resolve(thisPart.typeId, thisPart.states));
                            dimension.getBlock(otherPart.location).setPermutation(BlockPermutation.resolve(otherPart.typeId, otherPart.states));
                        } else {
                            const { location, typeId, states } = blockData;
                            if (session.settReplayType === 0 && customEntity) {
                                customEntity.playAnimation("animation.replayentity.attack");
                            }
                            playBlockSound(blockData, player);
                            dimension.getBlock(location).setPermutation(BlockPermutation.resolve(typeId, states));
                        }
                    }
                }
            }
        });
    }
}, 1);

system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        session.multiPlayers.forEach((player) => {
            if (session.replayStateMachine.state === "viewStartRep" || session.replayStateMachine.state === "recStartRep") {
                if (session.lilTick <= session.dbgRecTime) {
                    const playerData = session.replayBDataBMap.get(player.id);
                    const customEntity = session.replayODataMap.get(player.id);
                    const blockData = playerData.dbgBlockDataB[session.lilTick];
                    if (blockData) {
                        if (session.settReplayType === 0) {
                            customEntity.playAnimation("animation.replayentity.attack");
                        }
                        const dimension = world.getDimension(session.dbgRecController.dimension.id);
                        if (blockData.lowerPart && blockData.upperPart) {
                            const { lowerPart, upperPart } = blockData;
                            const lowerBlock = dimension.getBlock(lowerPart.location);

                            lowerBlock.setPermutation(BlockPermutation.resolve(lowerPart.typeId, lowerPart.states));
                            const upperBlock = dimension.getBlock(upperPart.location);

                            upperBlock.setPermutation(BlockPermutation.resolve(upperPart.typeId, upperPart.states));
                        } else {
                            const { location, typeId, states } = blockData;
                            const block = dimension.getBlock(location);
                            const permutation = BlockPermutation.resolve(typeId, states);
                            block.setPermutation(permutation);
                        }
                    }
                }
            }
        });
    }
}, 1);

//Collect player position data based on the current tick time
system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        session.multiPlayers.forEach((player) => {
            if (session.replayStateMachine.state !== "recPending") return;
            const posData = session.replayPosDataMap.get(player.id);
            /**
             *
             * is declared but its value is never read.
             * const customEntity = SharedVariables.replayODataMap.get(player.id);
             */
            const rotData = session.replayRotDataMap.get(player.id);
            if (!posData) return;
            const ploc = player.location;
            const rotxy = player.getRotation();
            posData.dbgRecPos.push(ploc);
            rotData.dbgRecRot.push(rotxy);
        });
    }
}, 1);

//entity? maybe play back ?
system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        session.multiPlayers.forEach((player) => {
            if (session.replayStateMachine.state === "viewStartRep" || session.replayStateMachine.state === "recStartRep") {
                const customEntity = session.replayODataMap.get(player.id);
                const posData = session.replayPosDataMap.get(player.id);
                const rotData = session.replayRotDataMap.get(player.id);
                if (!posData) return;

                if (session.settReplayType === 0) {
                    customEntity.teleport(posData.dbgRecPos[session.lilTick], {
                        rotation: rotData.dbgRecRot[session.lilTick],
                    });
                }
            }
        });
    }
}, 1);

/**Collect player sneak data based on the current tick time
 * We can expand this to collect the following data:
 * player.isClimbing
 * player.isFalling
 * player.isSwimming
 * player.isFlying
 * player.isGliding
 * player.isSleeping
 * */
system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        session.multiPlayers.forEach((player) => {
            if (session.replayStateMachine.state !== "recPending") return;
            const playerData = session.replayMDataMap.get(player.id);
            if (!playerData) return;
            playerData.isSneaking.push(player.isSneaking ? 1 : 0);
            if (config.devAnimations === true) {
                // playerData.isSwimming.push(player.isSwimming ? 1 : 0);
                // playerData.isClimbing.push(player.isClimbing ? 1 : 0);
                // playerData.isFalling.push(player.isFalling ? 1 : 0);
                // playerData.isFlying.push(player.isFlying ? 1 : 0);
                // playerData.isGliding.push(player.isGliding ? 1 : 0);
                playerData.isSleeping.push(player.isSleeping ? 1 : 0);
            }
        });
    }
}, 1);

system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        if (session.settReplayType !== 0) return;
        session.multiPlayers.forEach((player) => {
            if (session.replayStateMachine.state === "viewStartRep" || session.replayStateMachine.state === "recStartRep") {
                const playerData = session.replayMDataMap.get(player.id);
                const customEntity = session.replayODataMap.get(player.id);
                if (!playerData) return;
                customEntity.isSneaking = playerData.isSneaking[session.lilTick] === 1;
                // customEntity.setProperty("dbg:is_swimming", playerData.isSwimming[session.lilTick] === 1);
                // customEntity.setProperty("dbg:is_climbing", playerData.isClimbing[session.lilTick] === 1);
                // customEntity.setProperty("dbg:is_falling", playerData.isFalling[session.lilTick] === 1);
                // customEntity.setProperty("dbg:is_flying", playerData.isFlying[session.lilTick] === 1);
                // customEntity.setProperty("dbg:is_gliding", playerData.isGliding[session.lilTick] === 1);
                customEntity.setProperty("dbg:is_sleeping", playerData.isSleeping[session.lilTick] === 1);
            }
        });
    }
}, 1);

//Items/Weapons/Armor Data

system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        session.multiPlayers.forEach((player) => {
            if (session.replayStateMachine.state !== "recPending") return;
            const playerData = session.replaySDataMap.get(player.id);
            if (!playerData) return;
            playerData.weapon1.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Mainhand)?.typeId || "air");
            playerData.weapon2.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Offhand)?.typeId || "air");
            playerData.armor1.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Head)?.typeId || "air");
            playerData.armor2.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Chest)?.typeId || "air");
            playerData.armor3.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Legs)?.typeId || "air");
            playerData.armor4.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Feet)?.typeId || "air");
        });
    }
}, 1);

//TODO This can be optimized to use native methods.

system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        if (session.settReplayType !== 0) return;
        session.multiPlayers.forEach((player) => {
            if (session.replayStateMachine.state === "viewStartRep" || session.replayStateMachine.state === "recStartRep") {
                const playerData = session.replaySDataMap.get(player.id);
                const customEntity = session.replayODataMap.get(player.id);
                if (!playerData) return;
                customEntity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${playerData.weapon1[session.lilTick]}`);
                customEntity.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${playerData.weapon2[session.lilTick]}`);
                customEntity.runCommand(`replaceitem entity @s slot.armor.head 0 ${playerData.armor1[session.lilTick]}`);
                customEntity.runCommand(`replaceitem entity @s slot.armor.chest 0 ${playerData.armor2[session.lilTick]}`);
                customEntity.runCommand(`replaceitem entity @s slot.armor.legs 0 ${playerData.armor3[session.lilTick]}`);
                customEntity.runCommand(`replaceitem entity @s slot.armor.feet 0 ${playerData.armor4[session.lilTick]}`);
            }
        });
    }
}, 1);

//???
system.runInterval(() => {
    for (const session of SharedVariables.playerSessions.values()) {
        if (session.followCamSwitch === true) {
            session.dbgCamAffectPlayer.forEach((player) => {
                //const player = dbgRecController;
                const customEntity = session.replayODataMap.get(session.dbgCamFocusPlayer.id);
                const { x, y, z } = customEntity.location;
                const location = {
                    x,
                    y: y + 1.5,
                    z,
                };
                player.camera.setCamera("minecraft:free", {
                    facingLocation: location,
                    easeOptions: {
                        easeTime: 0.4,
                        easeType: EasingType.Linear,
                    },
                });
            });
        }
        if (session.topDownCamSwitch === true) {
            session.dbgCamAffectPlayer.forEach((player) => {
                //const player = dbgRecController;
                const customEntity = session.replayODataMap.get(session.dbgCamFocusPlayer.id);
                const { x, y, z } = customEntity.location;
                const location = {
                    x,
                    y: y + session.topDownCamHight,
                    z,
                };
                /**
             * left over code can this ben removed?
             * const location2 = {
                x,
                y,
                z
            };
             */

                player.camera.setCamera("minecraft:free", {
                    location: location,
                    //facingLocation: location2,
                    //facingEntity: customEntity,
                    rotation: {
                        x: 90,
                        y: 0,
                    },
                    easeOptions: {
                        easeTime: 0.4,
                        easeType: EasingType.Linear,
                    },
                });
            });
        }
        if (session.topDownCamSwitch2 === true) {
            session.dbgCamAffectPlayer.forEach((player) => {
                //const player = dbgRecController;
                const customEntity = session.replayODataMap.get(session.dbgCamFocusPlayer.id);
                const { x, y, z } = customEntity.location;
                customEntity.getRotation();
                const location = {
                    x,
                    y: y + session.topDownCamHight,
                    z,
                };
                const rotation = customEntity.getRotation();
                const rotation2 = {
                    x: 90,
                    y: rotation.y,
                };
                player.camera.setCamera("minecraft:free", {
                    location: location,
                    rotation: rotation2,
                    easeOptions: {
                        easeTime: 0.4,
                        easeType: EasingType.Linear,
                    },
                });
            });
        }
    }
}, 1);

export function playerDataDisplay(player: Player) {
    for (const session of SharedVariables.playerSessions.values()) {
        const playerData = session.replayMDataMap.get(player.id);
        try {
            console.log("Player Data:", JSON.stringify(playerData, null, 2)); // pretty-print
        } catch (err) {
            console.warn("Failed to stringify playerData:", err);
        }
    }
}

export function SharedVariablesDisplay() {
    for (const session of SharedVariables.playerSessions.values()) {
        const snapshot = {
            useFullRecordingRange: session.useFullRecordingRange,
            wantLoadFrameTick: session.wantLoadFrameTick,
            frameLoaded: session.frameLoaded,
            dbgRecTime: session.dbgRecTime,
            replayCamPosTicks: session.replayCamPos.map((p) => p.tick),
            replayCamRotTicks: session.replayCamRot.map((r) => r.tick),
            replayCamPosLength: session.replayCamPos.length,
            replayCamRotLength: session.replayCamRot.length,
            startingValueTick: session.startingValueTick,
            startingValueSecs: session.startingValueSecs,
        };

        try {
            console.log("=== SharedVariables Snapshot ===");
            console.log(JSON.stringify(snapshot, null, 2));
        } catch (err) {
            console.warn("Failed to stringify SharedVariables snapshot:", err);
        }
    }
}

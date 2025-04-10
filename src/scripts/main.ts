import { ReplayStateMachine } from "./classes/replayStateMachine";
import {  SharedVariablesType } from "./classes/types/types";
import { afterChatSend } from "./classes/subscriptions/chatSendAfterEvent";
import { replaycraftBreakBlockAfterEvent } from "./classes/subscriptions/playerBreakBlockAfterEvent";
import { replaycraftBreakBlockBeforeEvent } from "./classes/subscriptions/playerBreakBlockBeforeEvent";
import { replaycraftInteractWithBlockAfterEvent } from "./classes/subscriptions/playerInteractWithBlockAfterEvent";
import { replaycraftInteractWithBlockBeforeEvent } from "./classes/subscriptions/playerInteractWithBlockBeforeEvent";
import { replaycraftItemUseAfterEvent } from "./classes/subscriptions/playerItemUseAfterEvent";
import { replaycraftItemUseBeforeEvent } from "./classes/subscriptions/playerItemUseBeforeEvent";
import { replaycraftPlaceBlockBeforeEvent } from "./classes/subscriptions/playerPlaceBlockBeforeEvent";
import { replaycraftPlaceBlockAfterEvent } from "./classes/subscriptions/playerPlaceBlockAfterEvent";
import { BlockPermutation, EasingType, EquipmentSlot, system, world } from "@minecraft/server";
import { clearStructure } from "./functions/clearStructure";
import { playBlockSound } from "./functions/playBlockSound";
import { onPlayerSpawn } from "./classes/subscriptions/player-spawn";
import { subscribeToWorldInitialize } from "./classes/subscriptions/world-initialize";
//temp solution for the missing import this needs to be convered.
import './ReplayCraft.js';
//Global variables
export let SharedVariables: SharedVariablesType = {
    soundIds: ['place.amethyst_block', 'place.amethyst_cluster', 'place.azalea', 'place.azalea_leaves', 'place.bamboo_wood', 'place.big_dripleaf', 'place.calcite', 'place.cherry_leaves', 'place.cherry_wood', 'place.chiseled_bookshelf', 'place.copper', 'place.copper_bulb', 'place.deepslate', 'place.deepslate_bricks', 'place.dirt_with_roots', 'place.dripstone_block', 'place.hanging_roots', 'place.large_amethyst_bud', 'place.medium_amethyst_bud', 'place.moss', 'place.nether_wood', 'place.pink_petals', 'place.pointed_dripstone', 'place.powder_snow', 'place.sculk', 'place.sculk_catalyst', 'place.sculk_sensor', 'place.sculk_shrieker', 'place.small_amethyst_bud', 'place.spore_blossom', 'place.tuff', 'place.tuff_bricks', "use.ancient_debris", "use.basalt", "use.bone_block", "use.candle", "use.cave_vines", "use.chain", "use.cloth", "use.copper", "use.coral", "use.deepslate", "use.deepslate_bricks", "use.dirt_with_roots", "use.dripstone_block", "use.grass", "use.gravel", "use.hanging_roots", "use.honey_block", "use.ladder", "use.moss", "use.nether_brick", "use.nether_gold_ore", "use.nether_sprouts", "use.nether_wart", "use.netherite", "use.netherrack", "use.nylium", "use.pointed_dripstone", "use.roots", "use.sand", "use.sculk_sensor", "use.shroomlight", "use.slime", "use.snow", "use.soul_sand", "use.soul_soil", "use.spore_blossom", "use.stem", "use.stone", "use.vines", "use.wood"],
	easeTypes: ["Linear", "InBack", "InBounce", "InCirc", "InCubic", "InElastic", "InExpo", "InOutBack", "InOutBounce", "InOutCirc", "InOutCubic", "InOutElastic", "InOutExpo", "InOutQuad", "InOutQuart", "InOutQuint", "InOutSine", "InQuad", "InQuart", "InQuint", "InSine", "OutBack", "OutBounce", "OutCirc", "OutCubic", "OutElastic", "OutExpo", "OutQuad", "OutQuart", "OutQuint", "OutSine", "Spring"],
	skinTypes: ["Steve Skin", "Custom Skin1", "Custom Skin2", "Custom Skin3", "Custom Skin4"],
    dbgRecController: undefined,
    dbgRecTime: 0,
    replayStateMachine: new ReplayStateMachine(),
    multiPlayers: [],
    multiToggle: false,
    replayBDataMap: new Map(),
    replayBDataBMap: new Map(),
    replayBData1Map: new Map(),
    replayPosDataMap: new Map(),
    replayRotDataMap: new Map(),
    replayMDataMap: new Map(),
    replayODataMap: new Map(),
    replaySDataMap: new Map(),
    twoPartBlocks: ["minecraft:copper_door", "minecraft:exposed_copper_door", "minecraft:weathered_copper_door", "minecraft:oxidized_copper_door", "minecraft:waxed_copper_door", "minecraft:waxed_exposed_copper_door", "minecraft:waxed_weathered_copper_door", "minecraft:waxed_oxidized_copper_door", "minecraft:acacia_door", "minecraft:bamboo_door", "minecraft:birch_door", "minecraft:cherry_door", "minecraft:crimson_door", "minecraft:dark_oak_door", "minecraft:iron_door", "minecraft:jungle_door", "minecraft:mangrove_door", "minecraft:spruce_door", "minecraft:warped_door", "minecraft:wooden_door", "minecraft:sunflower", "minecraft:double_plant", "minecraft:tall_grass", "minecraft:large_fern"],
    toggleSound: false,
    selectedSound: 0,
    wantLoadFrameTick: 0,
    frameLoaded: false,
    startingValueTick: 0,
    replayCamPos: [],
    replayCamRot: [],
    soundCue: true,
    textPrompt: true,
    startingValueSecs: 0,
    startingValueMins: 0,
    startingValueHrs: 0,
    repCamTout1Map: new Map(),
    repCamTout2Map: new Map(),
    settCameraType: 1,
    replayCamEase: 0,
    settReplayType: 0,
    followCamSwitch: false,
    choosenReplaySkin: 0,
    settNameType: 1,
    settCustomName: "Type Custom Name",
    currentSwitch: false,
    lilTick: 0,
    replaySpeed: 1,
    dbgCamFocusPlayer: undefined,
    dbgCamAffectPlayer: [],
    topDownCamSwitch: false,
    topDownCamSwitch2: false,
    topDownCamHight: 8,
    focusPlayerSelection: 0,
    affectCameraSelection: 0,
    buildName: undefined,
    hideHUD: false,
};

//Chat events
afterChatSend();
//Events
replaycraftBreakBlockAfterEvent();
replaycraftBreakBlockBeforeEvent();
replaycraftPlaceBlockBeforeEvent();
replaycraftPlaceBlockAfterEvent();
replaycraftInteractWithBlockBeforeEvent();
replaycraftInteractWithBlockAfterEvent();
// soon to be removed from the API!
replaycraftItemUseAfterEvent();
replaycraftItemUseBeforeEvent();

//Show the player a useful message for the first time they join!
onPlayerSpawn();

//data-hive
subscribeToWorldInitialize();



//Timer for each frame?
system.runInterval(() => {
    if (SharedVariables.replayStateMachine.state === "recPending") {
        SharedVariables.dbgRecTime += 1;
    }
}, 1);

/* Allow replay to occur once the replay has finished call clearStructure
* remove the playback entity and reset the tick counter.
*/
system.runInterval(() => {
    if (SharedVariables.replayStateMachine.state === "viewStartRep") {
        if (SharedVariables.lilTick >= (SharedVariables.dbgRecTime - 1)) {
            SharedVariables.replayStateMachine.setState("recSaved");
            SharedVariables.multiPlayers.forEach((player) => {
                SharedVariables.currentSwitch = false;
                clearStructure(player);
                const entities1 = player.dimension.getEntities({
                    type: "dbg:replayentity"
                });
                entities1.forEach(entity1 => {
                    entity1.remove();
                });
            });
            SharedVariables.lilTick = 0;
            return;
        }
        SharedVariables.lilTick++
    }
}, 1);
//?
system.runInterval(() => {
    if (SharedVariables.replayStateMachine.state === "recStartRep") {
        if (SharedVariables.lilTick >= (SharedVariables.dbgRecTime - 1)) {
            SharedVariables.replayStateMachine.setState("recCompleted");
            SharedVariables.multiPlayers.forEach((player) => {
                SharedVariables.followCamSwitch = false;
                SharedVariables.topDownCamSwitch = false;
                SharedVariables.topDownCamSwitch2 = false;
                player.camera.clear();
                SharedVariables.currentSwitch = false;
                clearStructure(player);

                const entities1 = player.dimension.getEntities({
                    type: "dbg:replayentity"
                });
                entities1.forEach(entity1 => {
                    entity1.remove();
                });
            });
            SharedVariables.lilTick = 0;
            return;
        }
        SharedVariables.lilTick++
    }
}, 1);

system.runInterval(() => { // Load The Blocks Depending On The Tick 
    SharedVariables.multiPlayers.forEach((player) => {
        if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
            if (SharedVariables.lilTick <= SharedVariables.dbgRecTime) {
                const playerData = SharedVariables.replayBDataMap.get(player.id);
                const customEntity = SharedVariables.replayODataMap.get(player.id);
                if (playerData && playerData.dbgBlockData[SharedVariables.lilTick]) {
                    const blockData = playerData.dbgBlockData[SharedVariables.lilTick];

                    if (blockData.lowerPart && blockData.upperPart) {
                        const {
                            lowerPart,
                            upperPart
                        } = blockData;
                        const dimension = world.getDimension(player.dimension.id);
                        const lowerBlock = dimension.getBlock(lowerPart.location);

                        lowerBlock.setPermutation(BlockPermutation.resolve(lowerPart.typeId, lowerPart.states));
                        const upperBlock = dimension.getBlock(upperPart.location);

                        upperBlock.setPermutation(BlockPermutation.resolve(upperPart.typeId, upperPart.states));

                    } else if (blockData.thisPart && blockData.otherPart) {
                        const {
                            thisPart,
                            otherPart
                        } = blockData;
                        const dimension = world.getDimension(player.dimension.id);
                        dimension.getBlock(thisPart.location).setPermutation(BlockPermutation.resolve(thisPart.typeId, thisPart.states));
                        dimension.getBlock(otherPart.location).setPermutation(BlockPermutation.resolve(otherPart.typeId, otherPart.states));

                    } else {
                        const {
                            location,
                            typeId,
                            states
                        } = blockData;
                        if (SharedVariables.settReplayType === 0) {
                            customEntity.playAnimation("animation.replayentity.attack");
                        }
                        playBlockSound(blockData);
                        const dimension = world.getDimension(player.dimension.id);
                        const block = dimension.getBlock(location);
                        const permutation = BlockPermutation.resolve(typeId, states);
                        block.setPermutation(permutation);
                    }
                }
            }
        }
    });
}, 1);

system.runInterval(() => {
    SharedVariables.multiPlayers.forEach((player) => {
        if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
            if (SharedVariables.lilTick <= SharedVariables.dbgRecTime) {
                //const blockData = dbgBlockDataB[lilTick];
                const playerData = SharedVariables.replayBDataBMap.get(player.id);
                const customEntity = SharedVariables.replayODataMap.get(player.id);
                const blockData = playerData.dbgBlockDataB[SharedVariables.lilTick];
                if (blockData) {
                    if (SharedVariables.settReplayType === 0) {
                        customEntity.playAnimation("animation.replayentity.attack");
                    }
                    const dimension = world.getDimension(SharedVariables.dbgRecController.dimension.id);
                    if (blockData.lowerPart && blockData.upperPart) {
                        const {
                            lowerPart,
                            upperPart
                        } = blockData;
                        const lowerBlock = dimension.getBlock(lowerPart.location);

                        lowerBlock.setPermutation(BlockPermutation.resolve(lowerPart.typeId, lowerPart.states));
                        const upperBlock = dimension.getBlock(upperPart.location);

                        upperBlock.setPermutation(BlockPermutation.resolve(upperPart.typeId, upperPart.states));
                    } else {
                        const {
                            location,
                            typeId,
                            states
                        } = blockData;
                        const block = dimension.getBlock(location);
                        const permutation = BlockPermutation.resolve(typeId, states);
                        block.setPermutation(permutation);
                    }
                }
            }
        }
    });
}, 1);

//Collect player position data based on the current tick time
system.runInterval(() => {
    SharedVariables.multiPlayers.forEach((player) => {
        if (SharedVariables.replayStateMachine.state !== "recPending") return;
        const posData = SharedVariables.replayPosDataMap.get(player.id);
        /** 
         * 
         * is declared but its value is never read.
         * const customEntity = SharedVariables.replayODataMap.get(player.id);
        */
        const rotData = SharedVariables.replayRotDataMap.get(player.id);
        if (!posData) return;
        const ploc = player.location;
        const rotxy = player.getRotation();
        posData.dbgRecPos.push(ploc);
        rotData.dbgRecRot.push(rotxy);
    });
}, 1);

//entity? maybe play back ?
system.runInterval(() => {
    SharedVariables.multiPlayers.forEach((player) => {
        if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
            const customEntity = SharedVariables.replayODataMap.get(player.id);
            const posData = SharedVariables.replayPosDataMap.get(player.id);
            const rotData = SharedVariables.replayRotDataMap.get(player.id);
            if (!posData) return;

            if (SharedVariables.settReplayType === 0) {

                customEntity.teleport(posData.dbgRecPos[SharedVariables.lilTick], {
                    rotation: rotData.dbgRecRot[SharedVariables.lilTick]
                });
            }
        }
    });
}, 1);

//Movement data
system.runInterval(() => {
    SharedVariables.multiPlayers.forEach((player) => {
        if (SharedVariables.replayStateMachine.state !== "recPending") return;
        const playerData = SharedVariables.replayMDataMap.get(player.id);
        if (!playerData) return;
        playerData.isSneaking.push(player.isSneaking ? 1 : 0);
    });
}, 1);

system.runInterval(() => {
    if (SharedVariables.settReplayType !== 0) return;
    SharedVariables.multiPlayers.forEach((player) => {
        if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
            const playerData = SharedVariables.replayMDataMap.get(player.id);
            const customEntity = SharedVariables.replayODataMap.get(player.id);
            if (!playerData) return;
            customEntity.isSneaking = playerData.isSneaking[SharedVariables.lilTick] === 1;
        }
    });
}, 1);

//Items/Weapons/Armor Data

system.runInterval(() => {
    SharedVariables.multiPlayers.forEach((player) => {
        if (SharedVariables.replayStateMachine.state !== "recPending") return;
        const playerData = SharedVariables.replaySDataMap.get(player.id);
        if (!playerData) return;
        playerData.weapon1.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Mainhand)?.typeId || "air");
        playerData.weapon2.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Offhand)?.typeId || "air");
        playerData.armor1.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Head)?.typeId || "air");
        playerData.armor2.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Chest)?.typeId || "air");
        playerData.armor3.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Legs)?.typeId || "air");
        playerData.armor4.push(player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Feet)?.typeId || "air");
    });
}, 1);

//TODO This can be optimized to use native methods.

system.runInterval(() => {
    if (SharedVariables.settReplayType !== 0) return;
    SharedVariables.multiPlayers.forEach((player) => {
        if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
            const playerData = SharedVariables.replaySDataMap.get(player.id);
            const customEntity = SharedVariables.replayODataMap.get(player.id);
            if (!playerData) return;
            customEntity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${playerData.weapon1[SharedVariables.lilTick]}`);
            customEntity.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${playerData.weapon2[SharedVariables.lilTick]}`);
            customEntity.runCommand(`replaceitem entity @s slot.armor.head 0 ${playerData.armor1[SharedVariables.lilTick]}`);
            customEntity.runCommand(`replaceitem entity @s slot.armor.chest 0 ${playerData.armor2[SharedVariables.lilTick]}`);
            customEntity.runCommand(`replaceitem entity @s slot.armor.legs 0 ${playerData.armor3[SharedVariables.lilTick]}`);
            customEntity.runCommand(`replaceitem entity @s slot.armor.feet 0 ${playerData.armor4[SharedVariables.lilTick]}`);
        }
    });
}, 1);

//???
system.runInterval(() => {
    if (SharedVariables.followCamSwitch === true) {
        SharedVariables.dbgCamAffectPlayer.forEach((player) => {
            //const player = dbgRecController;
            const customEntity = SharedVariables.replayODataMap.get(SharedVariables.dbgCamFocusPlayer.id);
            const {
                x,
                y,
                z
            } = customEntity.location;
            const location = {
                x,
                y: y + 1.5,
                z
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
    if (SharedVariables.topDownCamSwitch === true) {
        SharedVariables.dbgCamAffectPlayer.forEach((player) => {
            //const player = dbgRecController;
            const customEntity = SharedVariables.replayODataMap.get(SharedVariables.dbgCamFocusPlayer.id);
            const {
                x,
                y,
                z
            } = customEntity.location;
            const location = {
                x,
                y: y + SharedVariables.topDownCamHight,
                z
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
                    y: 0
                },
                easeOptions: {
                    easeTime: 0.4,
                    easeType: EasingType.Linear,
                },
            });
        });
    }
    if (SharedVariables.topDownCamSwitch2 === true) {
        SharedVariables.dbgCamAffectPlayer.forEach((player) => {
            //const player = dbgRecController;
            const customEntity = SharedVariables.replayODataMap.get(SharedVariables.dbgCamFocusPlayer.id);
            const {
                x,
                y,
                z
            } = customEntity.location;
            customEntity.getRotation();
            const location = {
                x,
                y: y + SharedVariables.topDownCamHight,
                z
            };
            const rotation = customEntity.getRotation();
            const rotation2 = {
                x: 90,
                y: rotation.y
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
}, 1);


//@ts-check

import { world, system, BlockPermutation, EasingType } from "@minecraft/server";
import './ReplayCraft.js';
//------------------------------------------------
import { ReplayStateMachine } from "./classes/replayStateMachine.js";
import { afterChatSend } from "./classes/subscriptions/chatSendAfterEvent.js";

import { clearStructure } from "./functions/clearStructure.js";
import { playBlockSound } from "./functions/playBlockSound.js";
import { replaycraftBreakBlockBeforeEvent } from "./classes/subscriptions/playerBreakBlockBeforeEvent.js";
import { replaycraftPlaceBlockBeforeEvent } from "./classes/subscriptions/playerPlaceBlockBeforeEvent.js";
import { replaycraftBreakBlockAfterEvent } from "./classes/subscriptions/playerBreakBlockAfterEvent.js";
import {replaycraftPlaceBlockAfterEvent} from "./classes/subscriptions/playerPlaceBlockAfterEvent.js";
import {replaycraftInteractWithBlockBeforeEvent} from "./classes/subscriptions/playerInteractWithBlockBeforeEvent.js";
import {replaycraftInteractWithBlockAfterEvent} from "./classes/subscriptions/playerInteractWithBlockAfterEvent.js";
//showParticle();


const easeTypesCom = ["linear", "in_back", "in_bounce", "in_circ", "in_cubic", "in_elastic", "in_expo", "in_out_back", "in_out_bounce", "in_out_circ", "in_out_cubic", "in_out_elastic", "in_out_expo", "in_out_quad", "in_out_quart", "in_out_quint", "in_out_sine", "in_quad", "in_quart", "in_quint", "in_sine", "out_back", "out_bounce", "out_circ", "out_cubic", "out_elastic", "out_expo", "out_quad", "out_quart", "out_quint", "out_sine", "spring"];

export let SharedVariables = {
	soundIds: ['place.amethyst_block', 'place.amethyst_cluster', 'place.azalea', 'place.azalea_leaves', 'place.bamboo_wood', 'place.big_dripleaf', 'place.calcite', 'place.cherry_leaves', 'place.cherry_wood', 'place.chiseled_bookshelf', 'place.copper', 'place.copper_bulb', 'place.deepslate', 'place.deepslate_bricks', 'place.dirt_with_roots', 'place.dripstone_block', 'place.hanging_roots', 'place.large_amethyst_bud', 'place.medium_amethyst_bud', 'place.moss', 'place.nether_wood', 'place.pink_petals', 'place.pointed_dripstone', 'place.powder_snow', 'place.sculk', 'place.sculk_catalyst', 'place.sculk_sensor', 'place.sculk_shrieker', 'place.small_amethyst_bud', 'place.spore_blossom', 'place.tuff', 'place.tuff_bricks', "use.ancient_debris", "use.basalt", "use.bone_block", "use.candle", "use.cave_vines", "use.chain", "use.cloth", "use.copper", "use.coral", "use.deepslate", "use.deepslate_bricks", "use.dirt_with_roots", "use.dripstone_block", "use.grass", "use.gravel", "use.hanging_roots", "use.honey_block", "use.ladder", "use.moss", "use.nether_brick", "use.nether_gold_ore", "use.nether_sprouts", "use.nether_wart", "use.netherite", "use.netherrack", "use.nylium", "use.pointed_dripstone", "use.roots", "use.sand", "use.sculk_sensor", "use.shroomlight", "use.slime", "use.snow", "use.soul_sand", "use.soul_soil", "use.spore_blossom", "use.stem", "use.stone", "use.vines", "use.wood"],
	easeTypes: ["Linear", "InBack", "InBounce", "InCirc", "InCubic", "InElastic", "InExpo", "InOutBack", "InOutBounce", "InOutCirc", "InOutCubic", "InOutElastic", "InOutExpo", "InOutQuad", "InOutQuart", "InOutQuint", "InOutSine", "InQuad", "InQuart", "InQuint", "InSine", "OutBack", "OutBounce", "OutCirc", "OutCubic", "OutElastic", "OutExpo", "OutQuad", "OutQuart", "OutQuint", "OutSine", "Spring"],
	skinTypes: ["Steve Skin", "Custom Skin1", "Custom Skin2", "Custom Skin3", "Custom Skin4"],
	dbgRecController: undefined,
	dbgRecTime:0,
	replayStateMachine: new ReplayStateMachine,
	multiPlayers: [],
	multiToggle: false, //Multiplayer replay check. 
	replayBDataMap: new Map(), //Block Related Data (After placing/breaking)
	replayBDataBMap:new Map(), //Interacted block (opening closing door)
 	replayBData1Map: new Map(), //Data of the blocks before player makes any changes (mainly used in clear structure)
	replayPosDataMap: new Map(), //Player Position Data
	replayRotDataMap: new Map(), //player Rotation Data
	replayMDataMap: new Map(), //Player Actions Data
	replayODataMap: new Map(), // Stores data related to the replay entity. {customEntity}
	replaySDataMap: new Map(), //Stores Armor & Weapon data.
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
	followCamSwitch: false, //Camera types
	choosenReplaySkin: 0,
 	settNameType: 1,
 	settCustomName: "Type Custom Name",
 	currentSwitch: false,
 	lilTick: 0,
 	replaySpeed: 1,
  	dbgCamFocusPlayer:  undefined, //Focus camera on which player
 	dbgCamAffectPlayer: [], //Whose camera will be affected 
 	topDownCamSwitch: false,
 	topDownCamSwitch2: false,
 	topDownCamHight: 8,
 	focusPlayerSelection: 0,
 	affectCameraSelection: 0,

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

//========================Start (Increase Time Per Tick)

system.runInterval(() => {
	if (SharedVariables.replayStateMachine.state === "recPending") {
		SharedVariables.dbgRecTime += 1;
	}
}, 1);

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

//============================Pos Per Tick

system.runInterval(() => {
	SharedVariables.multiPlayers.forEach((player) => {
		if (SharedVariables.replayStateMachine.state !== "recPending") return;
		const posData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
		const customEntity = SharedVariables.replayODataMap.get(player.id);
		const rotData = SharedVariables.replayRotDataMap.get(player.id);
		if (!posData) return;
		const ploc = player.location;
		const rotxy = player.getRotation();
		posData.dbgRecPos.push(ploc);
		rotData.dbgRecRot.push(rotxy);
	});
}, 1);



system.runInterval(() => {
	SharedVariables.multiPlayers.forEach((player) => {
		if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
			const customEntity = SharedVariables.replayODataMap.get(player.id);
			const posData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
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

//============================Movement/Actions

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

//============================Items/Weapons/Armor

system.runInterval(() => {
	SharedVariables.multiPlayers.forEach((player) => {
		if (SharedVariables.replayStateMachine.state !== "recPending") return;
		const playerData = SharedVariables.replaySDataMap.get(player.id);
		if (!playerData) return;
		playerData.weapon1.push(player.getComponent("minecraft:equippable").getEquipment("Mainhand")?.typeId || "air");
		playerData.weapon2.push(player.getComponent("minecraft:equippable").getEquipment("Offhand")?.typeId || "air");
		playerData.armor1.push(player.getComponent("minecraft:equippable").getEquipment("Head")?.typeId || "air");
		playerData.armor2.push(player.getComponent("minecraft:equippable").getEquipment("Chest")?.typeId || "air");
		playerData.armor3.push(player.getComponent("minecraft:equippable").getEquipment("Legs")?.typeId || "air");
		playerData.armor4.push(player.getComponent("minecraft:equippable").getEquipment("Feet")?.typeId || "air");
	});
}, 1);

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

//===================================================================================
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
			const location2 = {
				x,
				y,
				z
			};
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
			const {
				xRot,
				yRot
			} = customEntity.getRotation();
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

//============================================================================================
// Experimental code not used or being tested?
/* 
function resetSett2() {
	choosenReplaySkin = 0;
	settReplayType = 0;
	settNameType = 1;
	settCameraType = 1;
	replayCamEase = 0;
	settCustomName = "Type Custom Name";

	replayCamPos = [];
	replayCamRot = [];
}
function whatToDo(player) { //Start Rec (First Menu)
	const aboutForm = new ui.ActionFormData()
		.title("Â§9What To Do Here ??")
		.button("Got It!")
		.body(`This is early version so all the replay feature in this are still work in progress, please use it carefully. Feel free to share your feedbacks.
\n`);
	return new Promise((resolve, reject) => {
		aboutForm.show(player).then(result => {
			resolve(result);
			ReplayCraft2A(player);
		}).catch(err => {
			reject(err);
		});
	});
}

//===================================================================
function saveReplayData(player) {
	const replayBData = SharedVariables.replayBDataMap.get(player.id);
	const replayBDataB = SharedVariables.replayBDataBMap.get(player.id);
	const replayBData1 = SharedVariables.replayBData1Map.get(player.id);
	const replayPosData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
	const replayRotData = SharedVariables.replayRotDataMap.get(player.id);
	const replayMData = SharedVariables.replayMDataMap.get(player.id);
	//const replayOData = SharedVariables.replayODataMap.get(player.id);
	const replaySData = SharedVariables.replaySDataMap.get(player.id);

	if (replayBData) world.setDynamicProperty(`replayBData_${player.id}`, JSON.stringify(replayBData));
	if (replayBDataB) world.setDynamicProperty(`replayBDataB_${player.id}`, JSON.stringify(replayBDataB));
	if (replayBData1) world.setDynamicProperty(`replayBData1_${player.id}`, JSON.stringify(replayBData1));
	if (replayPosData) world.setDynamicProperty(`replayPosData_${player.id}`, JSON.stringify(replayPosData));
	if (replayRotData) world.setDynamicProperty(`replayRotData_${player.id}`, JSON.stringify(replayRotData));
	if (replayMData) world.setDynamicProperty(`replayMData_${player.id}`, JSON.stringify(replayMData));
	//if (replayOData) world.setDynamicProperty(`replayOData_${player.id}`, JSON.stringify(replayOData));
	if (replaySData) world.setDynamicProperty(`replaySData_${player.id}`, JSON.stringify(replaySData));

	player.onScreenDisplay.setActionBar(`Replay Data Has Been Arrested`);
}

function retrieveReplayData(player) {
	const replayBData = world.getDynamicProperty(`replayBData_${player.id}`);
	const replayBDataB = world.getDynamicProperty(`replayBDataB_${player.id}`);
	const replayBData1 = world.getDynamicProperty(`replayBData1_${player.id}`);
	const replayPosData = world.getDynamicProperty(`replayPosData_${player.id}`);
	const replayRotData = world.getDynamicProperty(`replayRotData_${player.id}`);
	const replayMData = world.getDynamicProperty(`replayMData_${player.id}`);
	//const replayOData = world.getDynamicProperty(`replayOData_${player.id}`);
	const replaySData = world.getDynamicProperty(`replaySData_${player.id}`);

	const parsedBData = replayBData ? JSON.parse(replayBData) : null;
	const parsedBDataB = replayBDataB ? JSON.parse(replayBDataB) : null;
	const parsedBData1 = replayBData1 ? JSON.parse(replayBData1) : null;
	const parsedPosData = replayPosData ? JSON.parse(replayPosData) : null;
	const parsedRotData = replayRotData ? JSON.parse(replayRotData) : null;
	const parsedMData = replayMData ? JSON.parse(replayMData) : null;
	//const parsedOData = replayOData ? JSON.parse(replayOData) : null;
	const parsedSData = replaySData ? JSON.parse(replaySData) : null;

	if (parsedBData) SharedVariables.replayBDataMap.set(player.id, parsedBData);
	if (parsedBDataB) SharedVariables.replayBDataBMap.set(player.id, parsedBDataB);
	if (parsedBData1) SharedVariables.replayBData1Map.set(player.id, parsedBData1);
	if (parsedPosData) SharedVariables.SharedVariables.replayPosDataMap.set(player.id, parsedPosData);
	if (parsedRotData) SharedVariables.replayRotDataMap.set(player.id, parsedRotData);
	if (parsedMData) SharedVariables.replayMDataMap.set(player.id, parsedMData);
	//if (parsedOData) SharedVariables.replayODataMap.set(player.id, parsedOData);
	if (parsedSData) SharedVariables.replaySDataMap.set(player.id, parsedSData);

	player.onScreenDisplay.setActionBar(`Replay Data Has Been Released`);
}


function saveReplaySettings() {
	world.setDynamicProperty("soundCue", soundCue);
	world.setDynamicProperty("textPrompt", textPrompt);
	world.setDynamicProperty("SharedVariables.selectedSound", SharedVariables.selectedSound);
	world.setDynamicProperty("SharedVariables.toggleSound", SharedVariables.toggleSound);
	world.setDynamicProperty("choosenReplaySkin", choosenReplaySkin);
	world.setDynamicProperty("settReplayType", settReplayType);
	world.setDynamicProperty("settNameType", settNameType);
	world.setDynamicProperty("settCameraType", settCameraType);
	world.setDynamicProperty("replayCamEase", replayCamEase);
	world.setDynamicProperty("settCustomName", settCustomName);
	world.setDynamicProperty("wantLoadFrameTick", wantLoadFrameTick);
	world.setDynamicProperty("frameLoaded", frameLoaded);
	world.setDynamicProperty("startingValueTick", startingValueTick);
	world.setDynamicProperty("startingValueSecs", startingValueSecs);
	world.setDynamicProperty("startingValueMins", startingValueMins);
	world.setDynamicProperty("startingValueHrs", startingValueHrs);
	world.setDynamicProperty("SharedVariables.multiToggle", SharedVariables.multiToggle);
	world.setDynamicProperty("replaySpeed", replaySpeed);
	world.setDynamicProperty("followCamSwitch", followCamSwitch);
	world.setDynamicProperty("topDownCamSwitch", topDownCamSwitch);
	world.setDynamicProperty("topDownCamSwitch2", topDownCamSwitch2);
	world.setDynamicProperty("topDownCamHight", topDownCamHight);
	world.setDynamicProperty("focusPlayerSelection", focusPlayerSelection);
	world.setDynamicProperty("affectCameraSelection", affectCameraSelection);
}

function retrieveReplaySettings() {
	soundCue = world.getDynamicProperty("soundCue") ?? true;
	textPrompt = world.getDynamicProperty("textPrompt") ?? true;
	SharedVariables.selectedSound = world.getDynamicProperty("SharedVariables.selectedSound") ?? 0;
	SharedVariables.toggleSound = world.getDynamicProperty("SharedVariables.toggleSound") ?? false;
	choosenReplaySkin = world.getDynamicProperty("choosenReplaySkin") ?? 0;
	settReplayType = world.getDynamicProperty("settReplayType") ?? 0;
	settNameType = world.getDynamicProperty("settNameType") ?? 1;
	settCameraType = world.getDynamicProperty("settCameraType") ?? 1;
	replayCamEase = world.getDynamicProperty("replayCamEase") ?? 0;
	settCustomName = world.getDynamicProperty("settCustomName") ?? "Type Custom Name";
	wantLoadFrameTick = world.getDynamicProperty("wantLoadFrameTick") ?? 0;
	frameLoaded = world.getDynamicProperty("frameLoaded") ?? false;
	startingValueTick = world.getDynamicProperty("startingValueTick") ?? 0;
	startingValueSecs = world.getDynamicProperty("startingValueSecs") ?? 0;
	startingValueMins = world.getDynamicProperty("startingValueMins") ?? 0;
	startingValueHrs = world.getDynamicProperty("startingValueHrs") ?? 0;
	SharedVariables.multiToggle = world.getDynamicProperty("SharedVariables.multiToggle") ?? false;
	
	
	replaySpeed = world.getDynamicProperty("replaySpeed") ?? 1;
	followCamSwitch = world.getDynamicProperty("followCamSwitch") ?? false;
	topDownCamSwitch = world.getDynamicProperty("topDownCamSwitch") ?? false;
	topDownCamSwitch2 = world.getDynamicProperty("topDownCamSwitch2") ?? false;
	topDownCamHight = world.getDynamicProperty("topDownCamHight") ?? 8;
	focusPlayerSelection = world.getDynamicProperty("focusPlayerSelection") ?? 0;
	affectCameraSelection = world.getDynamicProperty("affectCameraSelection") ?? 0;
}

function saveReplayAnchors() {
	world.setDynamicProperty("replayMachineState", SharedVariables.replayStateMachine.state);
	

	if (dbgRecController) {
		world.setDynamicProperty("dbgRecController", dbgRecController.id);
	}
	if (dbgCamFocusPlayer) {
		world.setDynamicProperty("dbgCamFocusPlayer", dbgCamFocusPlayer.id);
	}
	
	world.setDynamicProperty("replayCamPos", JSON.stringify(replayCamPos));
	world.setDynamicProperty("replayCamRot", JSON.stringify(replayCamRot));
	world.setDynamicProperty("currentSwitch", currentSwitch);
	world.setDynamicProperty("SharedVariables.dbgRecTime", SharedVariables.dbgRecTime);
	world.setDynamicProperty("lilTick", lilTick);
	
	//Saving all the ids of SharedVariables.multiPlayers
	const playerIDs = SharedVariables.multiPlayers.map(player => player.id);
    world.setDynamicProperty("SharedVariables.multiPlayers", JSON.stringify(playerIDs));
	
}
function retrieveReplayAnchors() {
	SharedVariables.replayStateMachine.setState(world.getDynamicProperty("replayMachineState"));
	
	const dbgRecControllerId = world.getDynamicProperty("dbgRecController");
	const dbgCamFocusPlayerId = world.getDynamicProperty("dbgCamFocusPlayer");

	for (const player of world.getPlayers()) {
		if (dbgRecControllerId && player.id === dbgRecControllerId) {
			dbgRecController = player;
		}
		if (dbgCamFocusPlayerId && player.id === dbgCamFocusPlayerId) {
			dbgCamFocusPlayer = player;
		}
	}
	
	replayCamPos = JSON.parse(world.getDynamicProperty("replayCamPos") ?? "[]");
	replayCamRot = JSON.parse(world.getDynamicProperty("replayCamRot") ?? "[]");
	currentSwitch = world.getDynamicProperty("currentSwitch") ?? false;
	SharedVariables.dbgRecTime = world.getDynamicProperty("SharedVariables.dbgRecTime") ?? 0;
	lilTick = world.getDynamicProperty("lilTick") ?? 0;

	//Player ids to {player} in [SharedVariables.multiPlayers]
	const playerIDs = JSON.parse(world.getDynamicProperty("SharedVariables.multiPlayers") ?? "[]");
    SharedVariables.multiPlayers = playerIDs
        .map(id => world.getPlayers().find(player => player.id === id))
        .filter(player => player);
}

function saveAffectedPlayer() {
    const playerIDs = dbgCamAffectPlayer.map(player => player.id);
    world.setDynamicProperty("dbgCamAffectPlayer", JSON.stringify(playerIDs));
}

function retrieveAffectedPlayer() {
    const playerIDs = JSON.parse(world.getDynamicProperty("dbgCamAffectPlayer") ?? "[]");
    dbgCamAffectPlayer = playerIDs
        .map(id => world.getPlayers().find(player => player.id === id))
        .filter(player => player);
}
*/
/*
world.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {
	if (itemStack?.typeId === 'minecraft:dirt') {
		saveReplayData(player);
		saveReplaySettings();
		saveReplayAnchors();
		saveAffectedPlayer();
	}
});

world.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {
	if (itemStack?.typeId === 'minecraft:glass') {
		retrieveReplayData(player);
		retrieveReplaySettings();
		retrieveReplayAnchors();
		retrieveAffectedPlayer();
	}
});
*/
/*

const easeTypesList = ["Linear", "InBack", "InBounce", "InCirc", "InCubic", "InElastic", "InExpo", "InOutBack", "InOutBounce", "InOutCirc", "InOutCubic", "InOutElastic", "InOutExpo", "InOutQuad", "InOutQuart", "InOutQuint", "InOutSine", "InQuad", "InQuart", "InQuint", "InSine", "OutBack", "OutBounce", "OutCirc", "OutCubic", "OutElastic", "OutExpo", "OutQuad", "OutQuart", "OutQuint", "OutSine", "Spring"];

world.afterEvents.itemUse.subscribe((eventData) => {
	const player = eventData.source;
	if (eventData.itemStack?.typeId === 'minecraft:dirt22') {
		
		const selecEase = easeTypesList[5];
		const finalEase = EasingType[selecEase];
		//player.sendMessage(`${tilt.pose.yaw}`);
		
		player.camera.setCamera("minecraft:follow_orbit");
	}
});


world.afterEvents.playerPlaceBlock.subscribe(event => {
	const { player, block } = event;
	let blockData = block.permutation.getAllStates();
    player.sendMessage(JSON.stringify(blockData));
    player.sendMessage(`${block.location.x} ${block.location.y} ${block.location.z}`);
});

*/

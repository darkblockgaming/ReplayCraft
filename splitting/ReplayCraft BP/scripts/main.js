import { world, system, Player, BlockPermutation, EasingType } from "@minecraft/server";
import { MessageFormResponse, ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { EquipmentSlot, EntityComponentTypes } from '@minecraft/server';
import * as ui from "@minecraft/server-ui";
import './ReplayCraft.js';
import { rcInfo } from './guideabout.js';
import { keyFeatures } from './guideabout.js';
//------------------------------------------------
import { replayStateMachine } from './SharedVariables.replayStateMachine.js';
import { afterChatSend } from "./classes/subscriptions/chatSendAfterEvent.js";
import{setdbgRecControllerAfter} from "./classes/subscriptions/playerInteractWithBlockAfterEvent.js";
import {setdbgRecControllerBefore} from "./classes/subscriptions/playerInteractWithBlockBeforeEvent.js";
//showParticle();

const easeTypes = ["Linear", "InBack", "InBounce", "InCirc", "InCubic", "InElastic", "InExpo", "InOutBack", "InOutBounce", "InOutCirc", "InOutCubic", "InOutElastic", "InOutExpo", "InOutQuad", "InOutQuart", "InOutQuint", "InOutSine", "InQuad", "InQuart", "InQuint", "InSine", "OutBack", "OutBounce", "OutCirc", "OutCubic", "OutElastic", "OutExpo", "OutQuad", "OutQuart", "OutQuint", "OutSine", "Spring"];
const easeTypesCom = ["linear", "in_back", "in_bounce", "in_circ", "in_cubic", "in_elastic", "in_expo", "in_out_back", "in_out_bounce", "in_out_circ", "in_out_cubic", "in_out_elastic", "in_out_expo", "in_out_quad", "in_out_quart", "in_out_quint", "in_out_sine", "in_quad", "in_quart", "in_quint", "in_sine", "out_back", "out_bounce", "out_circ", "out_cubic", "out_elastic", "out_expo", "out_quad", "out_quart", "out_quint", "out_sine", "spring"];
const soundIds = ['place.amethyst_block', 'place.amethyst_cluster', 'place.azalea', 'place.azalea_leaves', 'place.bamboo_wood', 'place.big_dripleaf', 'place.calcite', 'place.cherry_leaves', 'place.cherry_wood', 'place.chiseled_bookshelf', 'place.copper', 'place.copper_bulb', 'place.deepslate', 'place.deepslate_bricks', 'place.dirt_with_roots', 'place.dripstone_block', 'place.hanging_roots', 'place.large_amethyst_bud', 'place.medium_amethyst_bud', 'place.moss', 'place.nether_wood', 'place.pink_petals', 'place.pointed_dripstone', 'place.powder_snow', 'place.sculk', 'place.sculk_catalyst', 'place.sculk_sensor', 'place.sculk_shrieker', 'place.small_amethyst_bud', 'place.spore_blossom', 'place.tuff', 'place.tuff_bricks', "use.ancient_debris", "use.basalt", "use.bone_block", "use.candle", "use.cave_vines", "use.chain", "use.cloth", "use.copper", "use.coral", "use.deepslate", "use.deepslate_bricks", "use.dirt_with_roots", "use.dripstone_block", "use.grass", "use.gravel", "use.hanging_roots", "use.honey_block", "use.ladder", "use.moss", "use.nether_brick", "use.nether_gold_ore", "use.nether_sprouts", "use.nether_wart", "use.netherite", "use.netherrack", "use.nylium", "use.pointed_dripstone", "use.roots", "use.sand", "use.sculk_sensor", "use.shroomlight", "use.slime", "use.snow", "use.soul_sand", "use.soul_soil", "use.spore_blossom", "use.stem", "use.stone", "use.vines", "use.wood"];
const skinTypes = ["Steve Skin", "Custom Skin1", "Custom Skin2", "Custom Skin3", "Custom Skin4"];

export const SharedVariables = {
    dbgRecController: undefined,
	replayStateMachine: new replayStateMachine,
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
};
let soundCue = true;
let textPrompt = true;
let selectedSound = 0;
let toggleSound = false;
let choosenReplaySkin = 0;
let settReplayType = 0;
let settNameType = 1;
let settCameraType = 1;
let replayCamEase = 0;
let settCustomName = "Type Custom Name";

let wantLoadFrameTick = 0;
let frameLoaded = false;
let startingValueTick = 0;
let startingValueSecs = 0;
let startingValueMins = 0;
let startingValueHrs = 0;



let currentSwitch = false;

let dbgRecTime = 0;
let lilTick = 0;
let replaySpeed = 1;

let replayCamPos = [];
let replayCamRot = [];

let dbgCamFocusPlayer = undefined; //Focus camera on which player
let dbgCamAffectPlayer = []; //Whose camera will be affected 

let followCamSwitch = false; //Camera types
let topDownCamSwitch = false;
let topDownCamSwitch2 = false;

let topDownCamHight = 8;

let focusPlayerSelection = 0;
let affectCameraSelection = 0;

//Chat events
afterChatSend();
//Item events
setdbgRecControllerAfter();
setdbgRecControllerBefore();





//============================================================================================
//============================================================================================
//========================Start (Increase Time Per Tick)

system.runInterval(() => {
	if (SharedVariables.replayStateMachine.state === "recPending") {
		dbgRecTime += 1;
	}
}, 1);

system.runInterval(() => {
	if (SharedVariables.replayStateMachine.state === "viewStartRep") {
		if (lilTick >= (dbgRecTime - 1)) {
			SharedVariables.replayStateMachine.setState("recSaved");
			SharedVariables.multiPlayers.forEach((player) => {
				currentSwitch = false;
				clearStructure(player);
				const entities1 = player.dimension.getEntities({
					type: "dbg:replayentity"
				});
				entities1.forEach(entity1 => {
					entity1.remove();
				});
			});
			lilTick = 0;
			return;
		}
		lilTick++
	}
}, 1);

system.runInterval(() => {
	if (SharedVariables.replayStateMachine.state === "recStartRep") {
		if (lilTick >= (dbgRecTime - 1)) {
			SharedVariables.replayStateMachine.setState("recCompleted");
			SharedVariables.multiPlayers.forEach((player) => {
				followCamSwitch = false;
				topDownCamSwitch = false;
				topDownCamSwitch2 = false;
				player.camera.clear();
				currentSwitch = false;
				clearStructure(player);

				const entities1 = player.dimension.getEntities({
					type: "dbg:replayentity"
				});
				entities1.forEach(entity1 => {
					entity1.remove();
				});
			});
			lilTick = 0;
			return;
		}
		lilTick++
	}
}, 1);

//============================After Block

function playBlockSound(blockData) {
	if (toggleSound === false) return;
	const {
		location,
		typeId,
		states
	} = blockData;
	dbgRecController.playSound(soundIds[selectedSound], {
		position: location
	});
}

system.runInterval(() => { // Load The Blocks Depending On The Tick 
	SharedVariables.multiPlayers.forEach((player) => {
		if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
			if (lilTick <= dbgRecTime) {
				const playerData = SharedVariables.replayBDataMap.get(player.id);
				const customEntity = SharedVariables.replayODataMap.get(player.id);
				if (playerData && playerData.dbgBlockData[lilTick]) {
					const blockData = playerData.dbgBlockData[lilTick];

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
						if (settReplayType === 0) {
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


/*
world.afterEvents.entityHitBlock.subscribe(event => {
	const player = event.source;
	const block = event.block;
	player.onScreenDisplay.setActionBar(`${block.typeId}`);
});
*/

world.afterEvents.playerBreakBlock.subscribe(event => {
	if (SharedVariables.replayStateMachine.state === "recPending") {
		const {
			player,
			block
		} = event;
		if (!SharedVariables.multiPlayers.includes(player)) return;
		if (block.typeId === "minecraft:bed" || twoPartBlocks.includes(block.type.id)) {
			if (block.typeId === "minecraft:bed") {
				saveBedParts(block, player);
			} else {
				saveDoorParts(block, player);
			}
		} else {
			const playerData = SharedVariables.replayBDataMap.get(player.id);
			playerData.dbgBlockData[dbgRecTime] = {
				location: block.location,
				typeId: block.typeId,
				states: block.permutation.getAllStates()
			};
		}
	}
});

world.afterEvents.playerPlaceBlock.subscribe(event => {
	if (SharedVariables.replayStateMachine.state === "recPending") {
		const {
			player,
			block
		} = event;
		if (!SharedVariables.multiPlayers.includes(player)) return;
		if (block.typeId === "minecraft:bed" || twoPartBlocks.includes(block.type.id)) {
			if (block.typeId === "minecraft:bed") {
				saveBedParts(block, player);
			} else {
				saveDoorParts(block, player);
			}
		} else {
			const playerData = SharedVariables.replayBDataMap.get(player.id);
			playerData.dbgBlockData[dbgRecTime] = {
				location: block.location,
				typeId: block.typeId,
				states: block.permutation.getAllStates()
			};
		}
	}
});

function saveDoorParts(block, player) { //Calculate Orher Part Of Doors/Grass 
	const isUpper = block.permutation.getState("upper_block_bit");
	if (!isUpper) {
		const lowerPart = {
			location: block.location,
			typeId: block.typeId,
			states: block.permutation.getAllStates()
		};

		const upperPartLocation = {
			x: block.location.x,
			y: block.location.y + 1,
			z: block.location.z
		};
		const upperPartBlock = block.dimension.getBlock(upperPartLocation);
		const upperPart = {
			location: upperPartLocation,
			typeId: upperPartBlock.typeId,
			states: upperPartBlock.permutation.getAllStates()
		};

		const playerData = SharedVariables.replayBDataMap.get(player.id);
		playerData.dbgBlockData[dbgRecTime] = {
			lowerPart,
			upperPart
		};
	}
}

function saveBedParts(block, player) { //Calculate Other Part Of Bed
	const isHead = block.permutation.getState("head_piece_bit"); // true if head, false if foot
	const direction = block.permutation.getState("direction"); // 'north = 2', 'south = 0', 'east =3', 'west = 1'
	let otherPartLocation = {
		x: block.location.x,
		y: block.location.y,
		z: block.location.z
	};
	if (isHead) {
		if (direction === 2) otherPartLocation = {
			x: block.location.x,
			y: block.location.y,
			z: block.location.z + 1
		};
		else if (direction === 0) otherPartLocation = {
			x: block.location.x,
			y: block.location.y,
			z: block.location.z - 1
		};
		else if (direction === 3) otherPartLocation = {
			x: block.location.x - 1,
			y: block.location.y,
			z: block.location.z
		};
		else if (direction === 1) otherPartLocation = {
			x: block.location.x + 1,
			y: block.location.y,
			z: block.location.z
		};
	} else {
		if (direction === 2) otherPartLocation = {
			x: block.location.x,
			y: block.location.y,
			z: block.location.z - 1
		};
		else if (direction === 0) otherPartLocation = {
			x: block.location.x,
			y: block.location.y,
			z: block.location.z + 1
		};
		else if (direction === 3) otherPartLocation = {
			x: block.location.x + 1,
			y: block.location.y,
			z: block.location.z
		};
		else if (direction === 1) otherPartLocation = {
			x: block.location.x - 1,
			y: block.location.y,
			z: block.location.z
		};
	}
	const otherPartBlock = block.dimension.getBlock(otherPartLocation);
	if (otherPartBlock && otherPartBlock.typeId !== "minecraft:air") {
		const otherPart = {
			location: otherPartLocation,
			typeId: otherPartBlock.typeId,
			states: otherPartBlock.permutation.getAllStates()
		};

		const playerData = SharedVariables.replayBDataMap.get(player.id);
		playerData.dbgBlockData[dbgRecTime] = {
			thisPart: {
				location: block.location,
				typeId: block.typeId,
				states: block.permutation.getAllStates()
			},
			otherPart
		};
	}
}

//================
//Interact After Block
//================

system.runInterval(() => {
	SharedVariables.multiPlayers.forEach((player) => {
		if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
			if (lilTick <= dbgRecTime) {
				//const blockData = dbgBlockDataB[lilTick];
				const playerData = SharedVariables.replayBDataBMap.get(player.id);
				const customEntity = SharedVariables.replayODataMap.get(player.id);
				const blockData = playerData.dbgBlockDataB[lilTick];
				if (blockData) {
					if (settReplayType === 0) {
						customEntity.playAnimation("animation.replayentity.attack");
					}
					const dimension = world.getDimension(dbgRecController.dimension.id);
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


//Calculate Orher Part Of Doors/Grass
function saveDoorPartsB(block, player) {
	const isUpper = block.permutation.getState("upper_block_bit");
	if (!isUpper) {
		const lowerPart = {
			location: block.location,
			typeId: block.typeId,
			states: block.permutation.getAllStates()
		};
		const upperPartLocation = {
			x: block.location.x,
			y: block.location.y + 1,
			z: block.location.z
		};
		const upperPartBlock = block.dimension.getBlock(upperPartLocation);
		const upperPart = {
			location: upperPartLocation,
			typeId: upperPartBlock.typeId,
			states: upperPartBlock.permutation.getAllStates()
		};
		const playerData = SharedVariables.replayBDataBMap.get(player.id);
		playerData.dbgBlockDataB[dbgRecTime] = {
			lowerPart,
			upperPart
		};
	}
}

world.afterEvents.playerInteractWithBlock.subscribe(event => {
	if (SharedVariables.replayStateMachine.state === "recPending") {
		const {
			player,
			block
		} = event;
		if (!SharedVariables.multiPlayers.includes(player)) return;
		if (twoPartBlocks.includes(block.type.id)) {
			saveDoorPartsB(block, player);
		} else {
			const playerData = SharedVariables.replayBDataBMap.get(player.id);
			playerData.dbgBlockDataB[dbgRecTime] = {
				location: block.location,
				typeId: block.typeId,
				states: block.permutation.getAllStates()
			};
		}
	}
});


//============================Before Block

const twoPartBlocks = ["minecraft:copper_door", "minecraft:exposed_copper_door", "minecraft:weathered_copper_door", "minecraft:oxidized_copper_door", "minecraft:waxed_copper_door", "minecraft:waxed_exposed_copper_door", "minecraft:waxed_weathered_copper_door", "minecraft:waxed_oxidized_copper_door", "minecraft:acacia_door", "minecraft:bamboo_door", "minecraft:birch_door", "minecraft:cherry_door", "minecraft:crimson_door", "minecraft:dark_oak_door", "minecraft:iron_door", "minecraft:jungle_door", "minecraft:mangrove_door", "minecraft:spruce_door", "minecraft:warped_door", "minecraft:wooden_door", "minecraft:sunflower", "minecraft:double_plant", "minecraft:tall_grass", "minecraft:large_fern"];


async function clearStructure(player) {
    const playerData = SharedVariables.replayBData1Map.get(player.id);
    if (!playerData || !playerData.dbgBlockData1) return;

    const ticks = Object.keys(playerData.dbgBlockData1).map(Number).sort((a, b) => b - a);
    const visitedChunks = new Set();
    const CHUNK_RADIUS = 4 * 16; // 4 chunks * 16 blocks per chunk = 64 blocks

    // Get the recording start position
    const recordingStartPos = SharedVariables.SharedVariables.replayPosDataMap.get(player.id)?.dbgRecPos?.[0];
	// Store original position before teleporting
	const originalPos = player.location; 
    if (!recordingStartPos) {
        player.onScreenDisplay.setActionBar(`Error: Recording start position not found.`);
        return;
    }

    let playerTeleported = false; // Track if the player was teleported

    for (const tick of ticks) {
        const data = playerData.dbgBlockData1[tick];
        const blockPositions = [];

        if (data.lowerPart) {
            blockPositions.push(data.lowerPart.location, data.upperPart.location);
        } else if (data.thisPart) {
            blockPositions.push(data.thisPart.location, data.otherPart.location);
        } else {
            blockPositions.push(data.location);
        }

        for (const blockPos of blockPositions) {
            const chunkKey = `${Math.floor(blockPos.x / 16)},${Math.floor(blockPos.z / 16)}`;

            // Calculate if the player is within the 4-chunk radius of the target block
            const dx = player.location.x - blockPos.x;
            const dz = player.location.z - blockPos.z;
            const distanceSquared = dx * dx + dz * dz;
            const isFarAway = distanceSquared > CHUNK_RADIUS * CHUNK_RADIUS;

            // Only load chunk if the player is far away
            if (!visitedChunks.has(chunkKey) && isFarAway) {
                visitedChunks.add(chunkKey);

                // Attempt to teleport player to load chunk
                let success = false;
                if (isFarAway) {
                    success = player.tryTeleport(blockPos, { checkForBlocks: false });

                    // If teleport fails, try adjusting Y slightly to avoid collision
                    if (!success) {
                        success = player.tryTeleport({ x: blockPos.x, y: blockPos.y + 2, z: blockPos.z }, { checkForBlocks: false });
                    }

                    // Wait for chunk to load before modifying blocks
                    if (success) {
                        await new Promise(resolve => system.runTimeout(resolve, 5)); // Wait for ~5 game ticks
                        playerTeleported = true; // Mark player as teleported
                    }
                }
            }

            // Ensure the chunk is loaded
            const block = player.dimension.getBlock(blockPos);
            if (block) {
                // Log if the block is found
                //console.log(`Clearing block at: ${blockPos.x}, ${blockPos.y}, ${blockPos.z}`);
                
                // Clear the block
                block.setPermutation(BlockPermutation.resolve(data.typeId, data.states));
            } else {
                console.log(`Block not found at: ${blockPos.x}, ${blockPos.y}, ${blockPos.z}`);
            }
        }
    }

    // If the player was teleported, return them to the recording start position
    if (playerTeleported) {
        player.tryTeleport(originalPos, { checkForBlocks: false });
        //player.onScreenDisplay.setActionBar(`You have been teleported back to the start of the recording.`);
    }
}





function saveDoorParts1(block, player) {
	const isUpper = block.permutation.getState("upper_block_bit");
	if (!isUpper) {
		const lowerPart = {
			location: block.location,
			typeId: block.typeId,
			states: block.permutation.getAllStates()
		};
		const upperPartLocation = {
			x: block.location.x,
			y: block.location.y + 1,
			z: block.location.z
		};
		const upperPartBlock = block.dimension.getBlock(upperPartLocation);
		const upperPart = {
			location: upperPartLocation,
			typeId: upperPartBlock.typeId,
			states: upperPartBlock.permutation.getAllStates()
		};
		const playerData = SharedVariables.replayBData1Map.get(player.id);
		playerData.dbgBlockData1[dbgRecTime] = {
			lowerPart,
			upperPart
		};
	}
}

function saveBedParts1(block, player) { //Calculate Orher Part Of Bed
	const isHead = block.permutation.getState("head_piece_bit"); // true if head, false if foot
	const direction = block.permutation.getState("direction"); // 'north = 2', 'south = 0', 'east =3', 'west = 1'
	let otherPartLocation = {
		x: block.location.x,
		y: block.location.y,
		z: block.location.z
	};
	if (isHead) {
		if (direction === 2) otherPartLocation = {
			x: block.location.x,
			y: block.location.y,
			z: block.location.z + 1
		};
		else if (direction === 0) otherPartLocation = {
			x: block.location.x,
			y: block.location.y,
			z: block.location.z - 1
		};
		else if (direction === 3) otherPartLocation = {
			x: block.location.x - 1,
			y: block.location.y,
			z: block.location.z
		};
		else if (direction === 1) otherPartLocation = {
			x: block.location.x + 1,
			y: block.location.y,
			z: block.location.z
		};
	} else {
		if (direction === 2) otherPartLocation = {
			x: block.location.x,
			y: block.location.y,
			z: block.location.z - 1
		};
		else if (direction === 0) otherPartLocation = {
			x: block.location.x,
			y: block.location.y,
			z: block.location.z + 1
		};
		else if (direction === 3) otherPartLocation = {
			x: block.location.x + 1,
			y: block.location.y,
			z: block.location.z
		};
		else if (direction === 1) otherPartLocation = {
			x: block.location.x - 1,
			y: block.location.y,
			z: block.location.z
		};
	}
	const otherPartBlock = block.dimension.getBlock(otherPartLocation);
	if (otherPartBlock && otherPartBlock.typeId !== "minecraft:air") {
		const otherPart = {
			location: otherPartLocation,
			typeId: otherPartBlock.typeId,
			states: otherPartBlock.permutation.getAllStates()
		};

		const playerData = SharedVariables.replayBData1Map.get(player.id);
		playerData.dbgBlockData1[dbgRecTime] = {
			thisPart: {
				location: block.location,
				typeId: block.typeId,
				states: block.permutation.getAllStates()
			},
			otherPart
		};
	}
}

world.beforeEvents.playerBreakBlock.subscribe(event => {
	if (SharedVariables.replayStateMachine.state === "recPending") {
		const {
			player,
			block
		} = event;
		if (!SharedVariables.multiPlayers.includes(player)) return;
		if (block.typeId === "minecraft:bed" || twoPartBlocks.includes(block.type.id)) {
			if (block.typeId === "minecraft:bed") {
				saveBedParts1(block, player);
			} else {
				saveDoorParts1(block, player);
			}
		} else {
			const playerData = SharedVariables.replayBData1Map.get(player.id);
			playerData.dbgBlockData1[dbgRecTime] = {
				location: block.location,
				typeId: block.typeId,
				states: block.permutation.getAllStates()
			};
			//dbgBlockData1[dbgRecTime] = { location: block.location, typeId: block.typeId, states: block.permutation.getAllStates() };
		}
	}
});

world.beforeEvents.playerPlaceBlock.subscribe(event => {
	if (SharedVariables.replayStateMachine.state === "recPending") {
		const {
			player,
			block
		} = event;
		if (!SharedVariables.multiPlayers.includes(player)) return;
		if (block.typeId === "minecraft:bed" || twoPartBlocks.includes(block.type.id)) {
			if (block.typeId === "minecraft:bed") {
				saveBedParts1(block, player);
			} else {
				saveDoorParts1(block, player);
			}
		} else {
			const playerData = SharedVariables.replayBData1Map.get(player.id);
			playerData.dbgBlockData1[dbgRecTime] = {
				location: block.location,
				typeId: block.typeId,
				states: block.permutation.getAllStates()
			};
		}
	}
});

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
	if (SharedVariables.replayStateMachine.state === "recPending") {
		const {
			player,
			block
		} = event;
		if (!SharedVariables.multiPlayers.includes(player)) return;
		if (twoPartBlocks.includes(block.type.id)) {
			saveDoorParts1(block, player);
		} else {
			const playerData = SharedVariables.replayBData1Map.get(player.id);
			playerData.dbgBlockData1[dbgRecTime] = {
				location: block.location,
				typeId: block.typeId,
				states: block.permutation.getAllStates()
			};
		}
	}
});

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

function summonReplayEntity(player) {
	const posData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
	const rotData = SharedVariables.replayRotDataMap.get(player.id);
	let customEntity = undefined;
	if (!posData) return;

	if (settReplayType === 0) {
		customEntity = player.dimension.spawnEntity("dbg:replayentity", posData.dbgRecPos[0]);
		customEntity.setProperty("dbg:skin", choosenReplaySkin);

		if (settNameType === 0) {
			customEntity.nameTag = player.name;
		} else if (settNameType === 1) {
			customEntity.nameTag = player.name;
		} else if (settNameType === 2) {
			customEntity.nameTag = settCustomName;
		}
		SharedVariables.replayODataMap.set(player.id, customEntity);

	}
}

system.runInterval(() => {
	SharedVariables.multiPlayers.forEach((player) => {
		if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
			const customEntity = SharedVariables.replayODataMap.get(player.id);
			const posData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
			const rotData = SharedVariables.replayRotDataMap.get(player.id);
			if (!posData) return;

			if (settReplayType === 0) {

				customEntity.teleport(posData.dbgRecPos[lilTick], {
					rotation: rotData.dbgRecRot[lilTick]
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
	if (settReplayType !== 0) return;
	SharedVariables.multiPlayers.forEach((player) => {
		if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
			const playerData = SharedVariables.replayMDataMap.get(player.id);
			const customEntity = SharedVariables.replayODataMap.get(player.id);
			if (!playerData) return;
			customEntity.isSneaking = playerData.isSneaking[lilTick] === 1;
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
	if (settReplayType !== 0) return;
	SharedVariables.multiPlayers.forEach((player) => {
		if (SharedVariables.replayStateMachine.state === "viewStartRep" || SharedVariables.replayStateMachine.state === "recStartRep") {
			const playerData = SharedVariables.replaySDataMap.get(player.id);
			const customEntity = SharedVariables.replayODataMap.get(player.id);
			if (!playerData) return;
			customEntity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${playerData.weapon1[lilTick]}`);
			customEntity.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${playerData.weapon2[lilTick]}`);
			customEntity.runCommand(`replaceitem entity @s slot.armor.head 0 ${playerData.armor1[lilTick]}`);
			customEntity.runCommand(`replaceitem entity @s slot.armor.chest 0 ${playerData.armor2[lilTick]}`);
			customEntity.runCommand(`replaceitem entity @s slot.armor.legs 0 ${playerData.armor3[lilTick]}`);
			customEntity.runCommand(`replaceitem entity @s slot.armor.feet 0 ${playerData.armor4[lilTick]}`);
		}
	});
}, 1);

//===================================================================================

async function loadEntity(player) {
    const posData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
    const rotData = SharedVariables.replayRotDataMap.get(player.id);
    if (!posData || !rotData || posData.dbgRecPos.length === 0) {
        console.error(`Replay data missing for player ${player.name}`);
        return;
    }

    let customEntity;
    const maxIndex = Math.min(wantLoadFrameTick, posData.dbgRecPos.length - 1);
    const summonPos = posData.dbgRecPos[maxIndex];

    // Ensure chunk is loaded
    if (!isChunkLoaded(summonPos, player)) {
        console.log(`Chunk not loaded for ${player.name}, teleporting...`);

        // Teleport player near the chunk to load it
        const success = player.tryTeleport(summonPos, { checkForBlocks: false });

        if (success) {
            await waitForChunkLoad(summonPos, player);
        } else {
            console.error(`Failed to teleport ${player.name} to load chunk at ${summonPos.x}, ${summonPos.y}, ${summonPos.z}`);
            return;
        }
    }

    // Now summon the entity
    try {
        customEntity = player.dimension.spawnEntity("dbg:replayentity", summonPos);
        customEntity.setRotation(rotData.dbgRecRot[maxIndex]);
    } catch (error) {
        console.error(`Error spawning entity at ${summonPos.x}, ${summonPos.y}, ${summonPos.z}:`, error);
        return;
    }

    customEntity.nameTag = player.name;
}

// Function to check if a chunk is loaded
function isChunkLoaded(position, player) {
    try {
        return !!player.dimension.getBlock(position);
    } catch {
        return false;
    }
}

// Function to wait until a chunk is loaded
async function waitForChunkLoad(position, player) {
    let attempts = 10; // Max attempts to wait
    while (!isChunkLoaded(position, player) && attempts > 0) {
        console.log(`Waiting for chunk to load at ${position.x}, ${position.z}...`);
        await new Promise(resolve => system.runTimeout(resolve, 5)); // Wait 5 ticks
        attempts--;
    }

    if (attempts === 0) {
        console.error(`Chunk failed to load at ${position.x}, ${position.z} after multiple attempts.`);
    }
}


async function loadBlocksUpToTick(targetTick, player) {
    const playerData = SharedVariables.replayBDataMap.get(player.id);
    if (!playerData) {
        console.warn(`No block replay data for player ${player.name}`);
        return;
    }

    for (let tick = 0; tick <= targetTick; tick++) {
        const blockData = playerData.dbgBlockData[tick];
        if (!blockData) continue;

        // Function to safely get and modify a block
        async function setBlock(location, typeId, states) {
            if (!isChunkLoaded(location, player)) {
                console.warn(`Chunk not loaded for block at ${location.x}, ${location.y}, ${location.z}. Teleporting player...`);
                
                // Attempt to teleport player near the chunk
                const success = player.tryTeleport({ x: location.x, y: location.y + 2, z: location.z }, { checkForBlocks: false });
                
                if (success) {
                    await waitForChunkLoad(location, player); // Wait for chunk to load
                } else {
                    console.error(`Failed to teleport ${player.name} to load chunk at ${location.x}, ${location.y}, ${location.z}`);
                    return;
                }
            }
			console.log("dbgRecController:", dbgRecController);
			console.log("Dimension ID:", dbgRecController?.dimension?.id);

            const block = world.getDimension(dbgRecController.dimension.id).getBlock(location);
            if (!block) {
                console.error(`Failed to get block at ${location.x}, ${location.y}, ${location.z}`);
                return;
            }

            block.setPermutation(BlockPermutation.resolve(typeId, states));
        }

        // Handle different block parts safely
        if (blockData.lowerPart && blockData.upperPart) {
            await setBlock(blockData.lowerPart.location, blockData.lowerPart.typeId, blockData.lowerPart.states);
            await setBlock(blockData.upperPart.location, blockData.upperPart.typeId, blockData.upperPart.states);
        } else if (blockData.thisPart && blockData.otherPart) {
            await setBlock(blockData.thisPart.location, blockData.thisPart.typeId, blockData.thisPart.states);
            await setBlock(blockData.otherPart.location, blockData.otherPart.typeId, blockData.otherPart.states);
        } else if (blockData.location) {
            await setBlock(blockData.location, blockData.typeId, blockData.states);
        }
    }
}


function loadFrameTicksForm(player) {
	const replaySettingsForm = new ui.ModalFormData().title("Load Frames - Ticks");
	replaySettingsForm.slider("This is most accurate way of loading frames.\n\nSelect Frame (Ticks)",
		startingValueTick, dbgRecTime, 1, wantLoadFrameTick);
	replaySettingsForm.show(player).then(response => {
		if (response.canceled || !response.formValues) {
			return;
		}
		wantLoadFrameTick = response.formValues[0];
		const entities1 = player.dimension.getEntities({
			type: "dbg:replayentity"
		});
		entities1.forEach(entity1 => {
			entity1.remove();
		});
		SharedVariables.multiPlayers.forEach((player) => {
			clearStructure(player);
		});
		frameLoaded = true;
		SharedVariables.multiPlayers.forEach((player) => {
			loadEntity(player);
			loadBlocksUpToTick(wantLoadFrameTick, player);
		});

	});
}

function loadFrameSecondsForm(player) {
    const maxFrameSeconds = Math.floor(dbgRecTime / 20);
    const totalTicks = dbgRecTime;
    const form = new ui.ModalFormData()
        .title("Load Frames - Seconds")
        .slider(`These values are slightly rounded off.\n§bAccurate time: §r${(Math.round((dbgRecTime / 20) * 100) / 100).toFixed(2)}\n\nSelect Frame (Secs)`, startingValueSecs, maxFrameSeconds, 1, Math.floor(wantLoadFrameTick / 20));

    form.show(player).then(async (response) => {
        if (response.canceled || !response.formValues) return;

        const selectedSeconds = response.formValues[0];
        wantLoadFrameTick = Math.round((selectedSeconds / maxFrameSeconds) * totalTicks);

        const replayEntities = player.dimension.getEntities({ type: "dbg:replayentity" });
        replayEntities.forEach((entity) => entity.remove());

        // Step 1: Clear structures before loading new ones
        frameLoaded = true;
        await Promise.all(SharedVariables.multiPlayers.map(async (player) => {
            await clearStructure(player);
        }));

        // Step 2: Load entities and blocks after clearing structures
        await Promise.all(SharedVariables.multiPlayers.map(async (player) => {
            await loadEntity(player);
            await loadBlocksUpToTick(wantLoadFrameTick, player);
        }));
    });
}


function addPos(player) {
	if (frameLoaded === false) {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.please.load.a.frame.before.adding.camera.point"
				}]
			});
		}
		if (soundCue) {
			player.playSound("note.bass");
		}
		return;
	}
	const existingCamPoint = replayCamPos.find(cam => cam.tick === wantLoadFrameTick);
	if (existingCamPoint) {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.a.camera.point.already.exists.at.this.tick"
				}]
			});
		}
		if (soundCue) {
			player.playSound("note.bass");
		}
		return;
	}
	frameLoaded = true;
	startingValueTick = wantLoadFrameTick;
	startingValueSecs = Math.floor(wantLoadFrameTick / 20);
	
	const { x, y, z } = player.location;
	const spawnLocation = { x: x, y: y + 1.8, z: z };

	const cameraPosTick = wantLoadFrameTick;
	replayCamPos.push({
		position: player.getHeadLocation(),
		tick: cameraPosTick
	});
	replayCamRot.push({
		rotation: player.getRotation(),
		tick: cameraPosTick
	});
	const camPos1Entity = player.dimension.spawnEntity("dbg:rccampos", spawnLocation);
	camPos1Entity.nameTag = `Camera Point ${replayCamPos.length}`;
	if (textPrompt) {
		player.onScreenDisplay.setActionBar(`Â§bCamera point added successfully at about ${Math.round(cameraPosTick/20)} second(s).`);
	}
}


const repCamTout1Map = new Map();
const repCamTout2Map = new Map();

function startReplayCam(player) {
	if (settCameraType === 0) return;

	repCamTout1Map.set(player.id, []);
	repCamTout2Map.set(player.id, []);

	if (settCameraType === 1) {
		const ease = easeTypes[replayCamEase];

		if (replayCamPos.length === 0) {
			if (textPrompt) {
				player.onScreenDisplay.setActionBar({
					"rawtext": [{
						"translate": "dbg.rc1.mes.no.camera.points.found"
					}]
				});
			}
			if (soundCue) {
				player.playSound("note.bass");
			}
			return;
		}

		const firstPoint = replayCamPos[0];
		const firstTick = firstPoint.tick;
		const firstRot = replayCamRot[0];
		const timeOut1Id = system.runTimeout(() => {
			
			player.camera.setCamera("minecraft:free", {
				location: firstPoint.position,
				rotation: firstRot.rotation,
			});
			
			//player.runCommand(`camera @s set minecraft:free pos ${firstPoint.position} rot ${firstRot.rotation}`);
			//player.onScreenDisplay.setActionBar(`like dirt Interv 1`);
		}, firstTick);
		repCamTout1Map.get(player.id).push(timeOut1Id);

		for (let i = 0; i < replayCamPos.length - 1; i++) {
			const startPoint = replayCamPos[i];
			const endPoint = replayCamPos[i + 1];
			const startRot = replayCamRot[i];
			const endRot = replayCamRot[i + 1];
			const tickDiff = endPoint.tick - startPoint.tick;
			const easetime = tickDiff / 20;
			const timeOut2Id = system.runTimeout(() => {
				//player.onScreenDisplay.setActionBar(`Let = ${replayCamPos.length}, I${i}`);
				
				player.camera.setCamera("minecraft:free", {
					location: endPoint.position,
					rotation: endRot.rotation,
					easeOptions: {
						easeTime: easetime,
						easeType: EasingType[ease],
					},
				});
			
				//player.runCommand(`camera @s set minecraft:free ease ${easetime} ${ease} pos ${endPoint.position} rot ${endRot.rotation}`);
			}, startPoint.tick);
			repCamTout2Map.get(player.id).push(timeOut2Id);
		}
	}
	if (settCameraType === 2) {
		if (settReplayType === 1) return;
		if (replayCamPos.length === 0) {
			if (textPrompt) {
				player.onScreenDisplay.setActionBar({
					"rawtext": [{
						"translate": "dbg.rc1.mes.no.camera.points.found.add.atleast.one.camera.point"
					}]
				});
			}
			if (soundCue) {
				player.playSound("note.bass");
			}
			return;
		}
		const firstPoint = replayCamPos[0];
		const firstTick = firstPoint.tick;
		const firstRot = replayCamRot[0];

		const timeOut1Id = system.runTimeout(() => {
			
			player.camera.setCamera("minecraft:free", {
				location: firstPoint.position,
				rotation: firstRot.rotation,
			});
			
			//player.runCommand(`camera @s set minecraft:free pos ${firstPoint.position} rot ${firstRot.rotation}`);
			followCamSwitch = true;
		}, firstTick);
		repCamTout1Map.get(player.id).push(timeOut1Id);
	}
	if (settCameraType === 3) {
		if (settReplayType === 1) return;
		const firstPoint = replayCamPos[0];
		const firstTick = firstPoint.tick;
		const timeOut1Id = system.runTimeout(() => {
			//player.runCommand(`camera @s set minecraft:free pos ${location} rot 90 0`);
			topDownCamSwitch = true;
		}, firstTick);
		repCamTout1Map.get(player.id).push(timeOut1Id);
	}
	if (settCameraType === 4) {
		if (settReplayType === 1) return;
		const firstPoint = replayCamPos[0];
		const firstTick = firstPoint.tick;
		//const firstTick = firstPoint?.tick ?? 1;
		const timeOut1Id = system.runTimeout(() => {
			//player.runCommand(`camera @s set minecraft:free pos ${location} facing ${location2}`);
			topDownCamSwitch2 = true;
		}, firstTick);
		repCamTout1Map.get(player.id).push(timeOut1Id);
	}
}

system.runInterval(() => {
	if (followCamSwitch === true) {
		dbgCamAffectPlayer.forEach((player) => {
			//const player = dbgRecController;
			const customEntity = SharedVariables.replayODataMap.get(dbgCamFocusPlayer.id);
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
	if (topDownCamSwitch === true) {
		dbgCamAffectPlayer.forEach((player) => {
			//const player = dbgRecController;
			const customEntity = SharedVariables.replayODataMap.get(dbgCamFocusPlayer.id);
			const {
				x,
				y,
				z
			} = customEntity.location;
			const location = {
				x,
				y: y + topDownCamHight,
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
	if (topDownCamSwitch2 === true) {
		dbgCamAffectPlayer.forEach((player) => {
			//const player = dbgRecController;
			const customEntity = SharedVariables.replayODataMap.get(dbgCamFocusPlayer.id);
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
				y: y + topDownCamHight,
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
//============================================================================================
//============================================================================================

function ReplayCraft2A(player) { //Default
	const replayForm = new ui.ActionFormData()
		.title("dbg.rc1.title.replay.menu")
		.button("dbg.rc1.button.start.recording") //0
		.button("dbg.rc1.button.settings") //1
		//.button("What To Do?") //
		//.button("Key Features") //2
		.button("dbg.rc1.button.multiplayer.settings")
		.button("dbg.rc1.button.important.info") //3
		.body("dbg.rc1.body.2a");

	replayForm.show(player).then(result => {
		if (result.canceled) return;
		const actions = {
			0: () => doStart(player),
			1: () => mainSettings(player),
			//2: () => whatToDo(player),
			2: () => multiPlayersett(player),
			3: () => rcInfo(player),
		};
		const selectedAction = actions[result.selection];
		if (selectedAction) {
			selectedAction();
		}
	});
}

function ReplayCraft2B(player) { //if SharedVariables.replayStateMachine.state = recPending 
	const replayForm = new ui.ActionFormData()
		.title("dbg.rc1.title.replay.menu")
		.button("dbg.rc1.button.save.recording") //0
		.button("dbg.rc1.button.pause.recording") //1
		.button("dbg.rc1.button.cancel.recording") //2
		.body("dbg.rc1.body.2b");
	replayForm.show(player).then(result => {
		if (result.canceled) return;
		const actions = {
			0: () => doSave(player),
			1: () => doPause(player),
			2: () => cancelRec(player),
		};
		const selectedAction = actions[result.selection];
		if (selectedAction) {
			selectedAction();
		}
	});
}

function ReplayCraft2C(player) { //if SharedVariables.replayStateMachine.state = recPaused
	const replayForm = new ui.ActionFormData()
		.title("dbg.rc1.title.replay.menu")
		.button("dbg.rc1.button.save.recording") //0
		.button("dbg.rc1.button.resume.recording") //1
		.button("dbg.rc1.button.cancel.recording") //2
		.body("dbg.rc1.body.2c");
	replayForm.show(player).then(result => {
		if (result.canceled) return;
		const actions = {
			0: () => doSave(player),
			1: () => doResume(player),
			2: () => cancelRec(player),
		};
		const selectedAction = actions[result.selection];
		if (selectedAction) {
			selectedAction();
		}
	});
}

function ReplayCraft2D(player) { //if SharedVariables.replayStateMachine.state = recSaved
	const replayForm = new ui.ActionFormData()
		.title("dbg.rc1.title.replay.menu")
		.button("dbg.rc1.button.preview.replay") //0
		.button("dbg.rc1.button.stop.preview") //1
		.button("dbg.rc1.button.preview.settings") //2
		.button("dbg.rc1.button.start.camera.setup") //3
		.button("dbg.rc1.button.cancel.recording") //4
		.body("dbg.rc1.body.2d");
	replayForm.show(player).then(result => {
		if (result.canceled) return;
		const actions = {
			0: () => doViewReplay(player),
			1: () => doStopPreview(player),
			2: () => previewSettings(player),
			3: () => doCamSetup(player),
			4: () => cancelRec(player),
		};
		const selectedAction = actions[result.selection];
		if (selectedAction) {
			selectedAction();
		}
	});
}

function ReplayCraft2E(player) { //if SharedVariables.replayStateMachine.state = recCamSetup
	const replayForm = new ui.ActionFormData()
		.title("dbg.rc1.title.replay.menu")
		.button("dbg.rc1.button.load.frame.t") //0
		.button("dbg.rc1.button.load.frame.s") //1
		.button("dbg.rc1.button.add.camera.point") //2
		.button("dbg.rc1.button.proceed.further") //3
		.button("dbg.rc1.button.reset.camera.setup") //4
		.button("dbg.rc1.button.cancel.recording") //5
		.body("dbg.rc1.body.2e");
	replayForm.show(player).then(result => {
		if (result.canceled) return;
		const actions = {
			0: () => loadFrameTicksForm(player),
			1: () => loadFrameSecondsForm(player),
			2: () => addPos(player),
			3: () => doProceedFurther(player),
			4: () => resetCamSetup(player),
			5: () => cancelRec(player),
		};
		const selectedAction = actions[result.selection];
		if (selectedAction) {
			selectedAction();
		}
	});
}

function ReplayCraft2F(player) { //if SharedVariables.replayStateMachine.state = recSaved
	const replayForm = new ui.ActionFormData()
		.title("dbg.rc1.title.replay.menu")
		.button("dbg.rc1.button.start.replay") //0
		.button("dbg.rc1.button.stop.replay") //1
		.button("dbg.rc1.button.settings") //2
		.button("dbg.rc1.button.goback.camsetup") //3
		.button("dbg.rc1.button.load.structure.or.reset") //4
		.body("dbg.rc1.body.2f");
	replayForm.show(player).then(result => {
		if (result.canceled) return;
		const actions = {
			0: () => doReplay(player),
			1: () => doStopReplay(player),
			2: () => replaySettings(player),
			3: () => doCamSetupGoBack(player),
			4: () => cancelRec(player),
		};
		const selectedAction = actions[result.selection];
		if (selectedAction) {
			selectedAction();
		}
	});
}

function replaySettings(player) {
	if (currentSwitch === true) {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.please.wait.for.replay.to.be.completed"
				}]
			});
		}
		if (soundCue) {
			player.playSound("note.bass");
		}
		return;
	}
	const playerName = SharedVariables.multiPlayers.map(player => player.name);
	const replaySettingsForm = new ui.ModalFormData()
		.title("dbg.rc1.title.replay.settings")
		.dropdown("dbg.rc1.dropdown.title.replay.type", ["Default Replay", "Ghost Replay"], settReplayType)
		//.slider("Replay Speed", 1, 10, 1, replaySpeed)
		.dropdown("dbg.rc1.dropdown.title.replay.skin.type", skinTypes, choosenReplaySkin)
		.dropdown("dbg.rc1.dropdown.title.name.of.replay.player", ["Disable", "Player's Name", "Custom Name"], settNameType)
		.textField("dbg.rc1.textfield.custom.name", settCustomName)
		.dropdown("dbg.rc1.dropdown.title.camera.ease.type", easeTypes, replayCamEase)
		.dropdown("dbg.rc1.dropdown.title.camera.type", ["None (Free Cam)", "Cinematic Cam", "Focus Cam", "Top-Down Focus (Fixed)", "Top-Down Focus (Dynamic)"], settCameraType)
		.dropdown("dbg.rc1.dropdown.title.focus.on.player", playerName, focusPlayerSelection)
		.dropdown("dbg.rc1.dropdown.title.affect.camera.of.players", ["All Players", ...playerName], affectCameraSelection)
		.slider("drop.title.topdown.cam.height", 2, 20, 1, topDownCamHight);


	replaySettingsForm.show(player).then(response => {
		if (response.canceled) {
			if (textPrompt) {
				player.onScreenDisplay.setActionBar({
					"rawtext": [{
						"translate": "dbg.rc1.mes.please.click.submit"
					}]
				});
			}
			if (soundCue) {
				player.playSound("note.bass");
			}
			return;
		}
		settReplayType = response.formValues[0];
		//replaySpeed = response.formValues[1];
		choosenReplaySkin = response.formValues[1]
		settNameType = response.formValues[2];
		settCustomName = response.formValues[3];

		replayCamEase = response.formValues[4];
		settCameraType = response.formValues[5];
		focusPlayerSelection = response.formValues[6];
		dbgCamFocusPlayer = SharedVariables.multiPlayers[focusPlayerSelection];
		affectCameraSelection = response.formValues[7];
		if (affectCameraSelection === 0) {
			dbgCamAffectPlayer = SharedVariables.multiPlayers;
		} else {
			dbgCamAffectPlayer = [];
			dbgCamAffectPlayer[0] = SharedVariables.multiPlayers[affectCameraSelection - 1];
		}
		topDownCamHight = response.formValues[8];
	})
}

function previewSettings(player) {
	if (currentSwitch === true) {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.wait.for.replay.preview.end"
				}]
			});
		}
		if (soundCue) {
			player.playSound("note.bass");
		}
		return;
	}
	const replaySettingsForm = new ui.ModalFormData()
		.title("dbg.rc1.title.preview.settings")
		.dropdown("dbg.rc1.dropdown.title.preview.type", ["Default Preview", "Ghost Preview"], settReplayType)
		//.slider("Preview Speed", 1, 10, 1, replaySpeed)
		.dropdown("dbg.rc1.dropdown.title.preview.skin.type", skinTypes, choosenReplaySkin)
		.dropdown("dbg.rc1.dropdown.title.name.of.preview.player", ["Disable", "Player's Name", "Custom Name"], settNameType)
		.textField("dbg.rc1.textfield.title.custom.name", settCustomName)


	replaySettingsForm.show(player).then(response => {
		if (response.canceled) {
			if (textPrompt) {
				player.onScreenDisplay.setActionBar({
					"rawtext": [{
						"translate": "dbg.rc1.mes.please.click.submit"
					}]
				});
			}
			if (soundCue) {
				player.playSound("note.bass");
			}
			return;
		}
		settReplayType = response.formValues[0];
		replaySpeed = response.formValues[1];
		choosenReplaySkin = response.formValues[1];
		settNameType = response.formValues[2];
		settCustomName = response.formValues[3];
	})
}

function mainSettings(player) {
	const replaySettingsForm = new ui.ModalFormData()
		.title("dbg.rc1.title.replaycraft.settings")
		.toggle(`dbg.rc1.toggle.sound.cues`, soundCue)
		.toggle(`dbg.rc1.toggle.text.prompts`, textPrompt)
		.dropdown(`dbg.rc1.dropdown.select.block.placing.sound`, soundIds, selectedSound)
		.toggle(`dbg.rc1.toggle.block.placing.sound`, toggleSound);

	replaySettingsForm.show(player).then(response => {
		if (response.canceled) {
			if (textPrompt) {
				player.onScreenDisplay.setActionBar({
					"rawtext": [{
						"translate": "dbg.rc1.mes.please.click.submit"
					}]
				});
			}
			player.playSound("note.bass");
			return;
		}
		soundCue = response.formValues[0];
		textPrompt = response.formValues[1];
		selectedSound = response.formValues[2];
		toggleSound = response.formValues[3];
	})
}


function multiPlayersett(player) {
	const availablePlayers = world.getPlayers();
	if (availablePlayers.length === 1) {
		SharedVariables.multiPlayers = [];
		SharedVariables.multiPlayers.push(player);
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.no.other.players.available"
				}]
			});
		}
		player.playSound("note.bass");
		return;
	}
	const playerNames = availablePlayers.map((p, index) => `${index + 1}. ${p.name}`).join('\n'); // Add index before name

	const replaySettingsForm = new ui.ModalFormData()
		.title("dbg.rc1.title.multiplayer.settings")
		.toggle(`dbg.rc1.toggle.multiplayer.replay`, SharedVariables.multiToggle)
		.slider(`\nAvailable Players\n${playerNames}\n\nSelected Players`, 1, availablePlayers.length, 1, 1);

	replaySettingsForm.show(player).then(response => {
		if (response.canceled) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.please.click.submit"
				}]
			});
			player.playSound("note.bass");
			return;
		}
		if (response.formValues[1] === 1) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.you.have.to.select.multiple.players"
				}]
			});
			player.playSound("note.bass");
			return;
		}
		SharedVariables.multiToggle = response.formValues[0];
		if (SharedVariables.multiToggle === true) {
			SharedVariables.multiPlayers = [];
			const selectedNumber = response.formValues[1];
			for (let i = 0; i < selectedNumber; i++) {
				SharedVariables.multiPlayers.push(availablePlayers[i]);
			}
			player.onScreenDisplay.setActionBar(`Â§aAdded ${selectedNumber} players to multiplayer replay.`);
			player.playSound("note.pling");
		}
		if (SharedVariables.multiToggle === false) {
			SharedVariables.multiPlayers = [];
			SharedVariables.multiPlayers.push(player);
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.multiplayer.replay.is.off"
				}]
			});
		}
	});
}

//===========

function doStart(player) {
	SharedVariables.multiPlayers.forEach((player) => {
		removeEntities(player);
		resetRec(player);
	});
	SharedVariables.replayStateMachine.setState("recPending");
	dbgRecController = player;
	if (SharedVariables.multiToggle === false) {
		dbgCamFocusPlayer = dbgRecController;
		dbgCamAffectPlayer[0] = dbgRecController;
	}
	if (SharedVariables.multiToggle === true) {
		dbgCamAffectPlayer = SharedVariables.multiPlayers;
	}
	if (textPrompt) {
		//player.onScreenDisplay.setActionBar("dbg.rc1.message.recording.has.started");
		player.onScreenDisplay.setActionBar({
			"rawtext": [{
				"translate": "dbg.rc1.mes.rec.has.started"
			}]
		});
	}
}

function doResume(player) {
	SharedVariables.replayStateMachine.setState("recPending");
	dbgRecController = player;
	if (textPrompt) {
		player.onScreenDisplay.setActionBar({
			"rawtext": [{
				"translate": "dbg.rc1.mes.rec.resumed.successfully"
			}]
		});
	}
}

function doPause(player) {
	SharedVariables.replayStateMachine.setState("recPaused");
	if (textPrompt) {
		player.onScreenDisplay.setActionBar({
			"rawtext": [{
				"translate": "dbg.rc1.mes.rec.paused.successfully"
			}]
		});
	}
}

function doSave(player) {
	SharedVariables.replayStateMachine.setState("recSaved");
	if (textPrompt) {
		player.onScreenDisplay.setActionBar({
			"rawtext": [{
				"translate": "dbg.rc1.mes.rec.saved.successfully"
			}]
		});
	}
	SharedVariables.multiPlayers.forEach((player) => {
		clearStructure(player);
	});

}

async function doViewReplay(player) {
    if (currentSwitch === true) {
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.replay.preview.is.already.on"
                }]
            });
        }
        if (soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    SharedVariables.replayStateMachine.setState("viewStartRep");

    for (const player of SharedVariables.multiPlayers) {
        const posData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
        if (!posData || !posData.dbgRecPos) {
            console.error(`Replay position data not found for player ${player.name}`);
            continue;
        }

        const summonPos = posData.dbgRecPos[0];

        // Attempt to load the chunk by teleporting the player near it
        const success = player.tryTeleport(summonPos, { checkForBlocks: false });
        if (success) {
            await new Promise(resolve => system.runTimeout(resolve, 5)); // Wait a few ticks
        }

        // Now summon the entity
        summonReplayEntity(player);
    }

    currentSwitch = true;
}


function doStopPreview(player) {
	if (currentSwitch === true) {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.replay.preview.has.stopped.successfully"
				}]
			});
		}
		SharedVariables.replayStateMachine.setState("recSaved");

		SharedVariables.multiPlayers.forEach((player) => {
			const customEntity = SharedVariables.replayODataMap.get(player.id);
			customEntity.remove();
			clearStructure(player);
		});

		lilTick = 0;
		currentSwitch = false;
		return;
	} else {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.replay.preview.is.already.off"
				}]
			});
		}
		if (soundCue) {
			player.playSound("note.bass");
		}
	}
}

function doCamSetup(player) {
	if (currentSwitch === true) {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.please.wait.for.replay.prev.to.be.completed"
				}]
			});
		}
		if (soundCue) {
			player.playSound("note.bass");
		}
		return;
	}
	SharedVariables.replayStateMachine.setState("recCamSetup");
	if (textPrompt) {
		player.onScreenDisplay.setActionBar({
			"rawtext": [{
				"translate": "dbg.rc1.mes.please.do.the.cinematic.camera.setup"
			}]
		});
	}
	if (soundCue) {
		player.playSound("random.orb");
	}
}

function doCamSetupGoBack(player) {
	if (currentSwitch === true) {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.please.wait.for.replay.to.be.completed"
				}]
			});
		}
		if (soundCue) {
			player.playSound("note.bass");
		}
		return;
	}
	SharedVariables.replayStateMachine.setState("recCamSetup");
	replayCamPos = [];
	replayCamRot = [];
	wantLoadFrameTick = 0;
	if (textPrompt) {
		player.onScreenDisplay.setActionBar({
			"rawtext": [{
				"translate": "dbg.rc1.mes.please.do.the.cinematic.camera.setup"
			}]
		});
	}
}

function doProceedFurther(player) {
	if (replayCamPos.length <= 1) {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.at.least.two.camera.points.are.recommended"
				}]
			});
		}
		if (soundCue) {
			player.playSound("note.bass");
		}
		return;
	}
	SharedVariables.replayStateMachine.setState("recCompleted");
	SharedVariables.multiPlayers.forEach((player) => {
		clearStructure(player);
	});
	const entities = player.dimension.getEntities({
		type: "dbg:replayentity"
	});
	entities.forEach(entity => {
		entity.remove();
	});
	const entities2 = player.dimension.getEntities({
		type: "dbg:rccampos"
	});
	entities2.forEach(entity2 => {
		entity2.remove();
	});
}

async function doReplay(player) {
    if (currentSwitch === true) {
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{ "translate": "dbg.rc1.mes.replay.is.already.in.progress" }]
            });
        }
        if (soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    SharedVariables.replayStateMachine.setState("recStartRep");
    currentSwitch = true;

    const posData = SharedVariables.SharedVariables.replayPosDataMap.get(player.id);
    if (!posData || !posData.dbgRecPos || posData.dbgRecPos.length === 0) {
        console.warn(`No recorded positions found for player ${player.name}`);
        return;
    }

    const firstRecordedPos = posData.dbgRecPos[0];

    // Ensure chunk is loaded before proceeding
    if (!isChunkLoaded(firstRecordedPos, player)) {
        console.log(`Chunk not loaded for ${player.name}, teleporting...`);

        // Try teleporting to load the chunk
        const success = player.tryTeleport(firstRecordedPos, { checkForBlocks: false });

        if (success) {
            await waitForChunkLoad(firstRecordedPos, player);
        } else {
            console.error(`Failed to teleport ${player.name} to load chunk at ${firstRecordedPos.x}, ${firstRecordedPos.y}, ${firstRecordedPos.z}`);
            return;
        }
    }

    // Once chunk is loaded, proceed with replay
    dbgCamAffectPlayer.forEach((player) => {
        startReplayCam(player);
    });

    SharedVariables.multiPlayers.forEach((player) => {
        summonReplayEntity(player);
    });
}


function doStopCamera(player) {
	player.camera.clear();
	//player.runCommand(`camera @s clear`);

	const timeOut1Id = repCamTout1Map.get(player.id);
	timeOut1Id.forEach((timeOut1Id) => {
		system.clearRun(timeOut1Id);
	});
	repCamTout1Map.delete(player.id);

	const timeOut2Id = repCamTout2Map.get(player.id);
	timeOut2Id.forEach((timeOut2Id) => {
		system.clearRun(timeOut2Id);
	});
	repCamTout2Map.delete(player.id);
}

function doStopReplay(player) {
	if (currentSwitch === false) {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.replay.is.already.stopped"
				}]
			});
		}
		if (soundCue) {
			player.playSound("note.bass");
		}
		return;
	}
	SharedVariables.replayStateMachine.setState("recCompleted");
	if (settReplayType === 0) {
		SharedVariables.multiPlayers.forEach((player) => {

			followCamSwitch = false;
			topDownCamSwitch = false;
			topDownCamSwitch2 = false;

			const customEntity = SharedVariables.replayODataMap.get(player.id);
			customEntity.remove();
			clearStructure(player);

			player.camera.clear();
	//player.runCommand(`camera @s clear`);
			doStopCamera(player);
		});
	}
	lilTick = 0;
	currentSwitch = false;

	if (textPrompt) {
		player.onScreenDisplay.setActionBar({
			"rawtext": [{
				"translate": "dbg.rc1.mes.replay.stopped"
			}]
		});
	}
}

function cancelRec(player) {
	const replayForm = new ui.ActionFormData()
		.title("dbg.rc1.title.replay.menu")
		.button("dbg.rc1.button.load.build.and.Reset") //0
		.button("dbg.rc1.button.delete.progress") //1
		.body("dbg.rc1.body.made.by.dbg");
	replayForm.show(player).then(result => {
		if (result.canceled) return;
		const actions = {
			0: () => doSaveReset(player),
			1: () => deletePro(player),
		};
		const selectedAction = actions[result.selection];
		if (selectedAction) {
			selectedAction();
		}
	});
}

function removeEntities(player) {
	const dimension = player.dimension;
	const entities1 = dimension.getEntities({
		type: "dbg:replayentity"
	});
	entities1.forEach(entity1 => {
		entity1.remove();
	});
	const entities2 = dimension.getEntities({
		type: "dbg:rccampos"
	});
	entities2.forEach(entity2 => {
		entity2.remove();
	});
}

function deletePro(player) {
	if (currentSwitch === true) {
		if (textPrompt) {
			player.onScreenDisplay.setActionBar({
				"rawtext": [{
					"translate": "dbg.rc1.mes.please.wait.for.replay.or.preview.to.be.completed"
				}]
			});
		}
		if (soundCue) {
			player.playSound("note.bass");
		}
		return;
	}
	resetCamSetup(player);
	SharedVariables.replayStateMachine.setState("default");
	SharedVariables.multiPlayers.forEach((player) => {
		removeEntities(player);
		clearStructure(player);
		resetRec(player);
	});
	//resetSett2();
}

async function doSaveReset(player) {
    if (currentSwitch === true) {
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{ "translate": "dbg.rc1.mes.please.wait.for.replay.or.preview.to.be.completed" }]
            });
        }
        if (soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    resetCamSetup(player);
    SharedVariables.replayStateMachine.setState("default");

    // Wait for `clearStructure()` to finish before proceeding
    await clearStructure(player); 

    // Then remove entities
    removeEntities(player);

    // Now safely load blocks
    await loadBlocksUpToTick(dbgRecTime, player);

    // Final reset
    resetRec(player);
}


function resetRec(player) {
	dbgRecController = undefined;
	currentSwitch = false;
	dbgRecTime = 0;
	lilTick = 0;
	replaySpeed = 1;
	SharedVariables.replayBDataMap.set(player.id, {
		dbgBlockData: {},
	});
	SharedVariables.replayBDataBMap.set(player.id, {
		dbgBlockDataB: {}
	});
	SharedVariables.replayBData1Map.set(player.id, {
		dbgBlockData1: {}
	});
	SharedVariables.SharedVariables.replayPosDataMap.set(player.id, {
		dbgRecPos: []
	});
	SharedVariables.replayRotDataMap.set(player.id, {
		dbgRecRot: []
	});
	SharedVariables.replayMDataMap.set(player.id, {
		isSneaking: []
	});
	SharedVariables.replayODataMap.set(player.id, {
		customEntity: undefined
	});
	SharedVariables.replaySDataMap.set(player.id, {
		weapon1: [],
		weapon2: [],
		armor1: [],
		armor2: [],
		armor3: [],
		armor4: []
	});
}

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


function resetCamSetup(player) {
	SharedVariables.multiPlayers.forEach((player) => {
		clearStructure(player);
		removeEntities(player);
	});
	currentSwitch = false;
	frameLoaded = false;
	replayCamPos = [];
	replayCamRot = [];
	wantLoadFrameTick = 0;
	player.onScreenDisplay.setActionBar({
		"rawtext": [{
			"translate": "dbg.rc1.mes.interaction.successfull"
		}]
	});
	frameLoaded = false;
	startingValueTick = 0;
	startingValueSecs = 0;
	startingValueMins = 0;
	startingValueHrs = 0;
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
//===================================================================
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
	world.setDynamicProperty("selectedSound", selectedSound);
	world.setDynamicProperty("toggleSound", toggleSound);
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
	selectedSound = world.getDynamicProperty("selectedSound") ?? 0;
	toggleSound = world.getDynamicProperty("toggleSound") ?? false;
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
	world.setDynamicProperty("dbgRecTime", dbgRecTime);
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
	dbgRecTime = world.getDynamicProperty("dbgRecTime") ?? 0;
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

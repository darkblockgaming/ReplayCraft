import { world, system, BlockPermutation, EasingType } from "@minecraft/server";
import "@minecraft/server-ui";
import "@minecraft/server";
import * as mcUI from "@minecraft/server-ui";
import "./ReplayCraft.js";
import { rcInfo } from "./guideabout.js";
import "./guideabout.js";
const easeTypes = [
    "Linear",
    "InBack",
    "InBounce",
    "InCirc",
    "InCubic",
    "InElastic",
    "InExpo",
    "InOutBack",
    "InOutBounce",
    "InOutCirc",
    "InOutCubic",
    "InOutElastic",
    "InOutExpo",
    "InOutQuad",
    "InOutQuart",
    "InOutQuint",
    "InOutSine",
    "InQuad",
    "InQuart",
    "InQuint",
    "InSine",
    "OutBack",
    "OutBounce",
    "OutCirc",
    "OutCubic",
    "OutElastic",
    "OutExpo",
    "OutQuad",
    "OutQuart",
    "OutQuint",
    "OutSine",
    "Spring",
];
const easeTypesCom = [
    "linear",
    "in_back",
    "in_bounce",
    "in_circ",
    "in_cubic",
    "in_elastic",
    "in_expo",
    "in_out_back",
    "in_out_bounce",
    "in_out_circ",
    "in_out_cubic",
    "in_out_elastic",
    "in_out_expo",
    "in_out_quad",
    "in_out_quart",
    "in_out_quint",
    "in_out_sine",
    "in_quad",
    "in_quart",
    "in_quint",
    "in_sine",
    "out_back",
    "out_bounce",
    "out_circ",
    "out_cubic",
    "out_elastic",
    "out_expo",
    "out_quad",
    "out_quart",
    "out_quint",
    "out_sine",
    "spring",
];
const soundIds = [
    "place.amethyst_block",
    "place.amethyst_cluster",
    "place.azalea",
    "place.azalea_leaves",
    "place.bamboo_wood",
    "place.big_dripleaf",
    "place.calcite",
    "place.cherry_leaves",
    "place.cherry_wood",
    "place.chiseled_bookshelf",
    "place.copper",
    "place.copper_bulb",
    "place.deepslate",
    "place.deepslate_bricks",
    "place.dirt_with_roots",
    "place.dripstone_block",
    "place.hanging_roots",
    "place.large_amethyst_bud",
    "place.medium_amethyst_bud",
    "place.moss",
    "place.nether_wood",
    "place.pink_petals",
    "place.pointed_dripstone",
    "place.powder_snow",
    "place.sculk",
    "place.sculk_catalyst",
    "place.sculk_sensor",
    "place.sculk_shrieker",
    "place.small_amethyst_bud",
    "place.spore_blossom",
    "place.tuff",
    "place.tuff_bricks",
    "use.ancient_debris",
    "use.basalt",
    "use.bone_block",
    "use.candle",
    "use.cave_vines",
    "use.chain",
    "use.cloth",
    "use.copper",
    "use.coral",
    "use.deepslate",
    "use.deepslate_bricks",
    "use.dirt_with_roots",
    "use.dripstone_block",
    "use.grass",
    "use.gravel",
    "use.hanging_roots",
    "use.honey_block",
    "use.ladder",
    "use.moss",
    "use.nether_brick",
    "use.nether_gold_ore",
    "use.nether_sprouts",
    "use.nether_wart",
    "use.netherite",
    "use.netherrack",
    "use.nylium",
    "use.pointed_dripstone",
    "use.roots",
    "use.sand",
    "use.sculk_sensor",
    "use.shroomlight",
    "use.slime",
    "use.snow",
    "use.soul_sand",
    "use.soul_soil",
    "use.spore_blossom",
    "use.stem",
    "use.stone",
    "use.vines",
    "use.wood",
];
const skinTypes = ["Steve Skin", "Custom Skin1", "Custom Skin2", "Custom Skin3", "Custom Skin4"];
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
let multiToggle = false;
let multiPlayers = [];
let dbgRecController = undefined;
let currentSwitch = false;
let dbgRecTime = 0;
let lilTick = 0;
let replaySpeed = 1;
let replayCamPos = [];
let replayCamRot = [];
let dbgCamFocusPlayer = undefined;
let dbgCamAffectPlayer = [];
let followCamSwitch = false;
let topDownCamSwitch = false;
let topDownCamSwitch2 = false;
let topDownCamHight = 8;
let focusPlayerSelection = 0;
let affectCameraSelection = 0;
world.afterEvents.chatSend.subscribe((event) => {
    const { sender: player, message: messageData } = event;
    console.log(`[DEBUG] Chat Event - Sender: ${player.name}, Message: ${messageData}`);
    if (["?rc", "?dbgReplayCraft", "?ReplayCraft", "?replaycraft", "?RC", "?dbgreplaycraft"].includes(messageData)) {
        player.runCommand('loot give @s loot "rc_items"');
        player.onScreenDisplay.setActionBar({
            rawtext: [
                {
                    translate: "dbg.rc1.mes.thanks",
                },
            ],
        });
    }
});
class ReplayStateMachine {
    constructor() {
        this.state = "default";
        this.states = {
            recStartRep: this.handleRecStartRep.bind(this),
            viewStartRep: this.handleViewStartRep.bind(this),
            recCompleted: this.handleRecCompleted.bind(this),
            recCamSetup: this.handleRecCamSetup.bind(this),
            recSaved: this.handleRecSaved.bind(this),
            recPaused: this.handleRecPaused.bind(this),
            recPending: this.handleRecPending.bind(this),
            default: this.handleDefault.bind(this),
        };
    }

    handleRecStartRep(player) {
        ReplayCraft2F(player);
    }

    handleViewStartRep(player) {
        ReplayCraft2D(player);
    }

    handleRecCompleted(player) {
        ReplayCraft2F(player);
    }

    handleRecCamSetup(player) {
        ReplayCraft2E(player);
    }

    handleRecSaved(player) {
        ReplayCraft2D(player);
    }

    handleRecPaused(player) {
        ReplayCraft2C(player);
    }

    handleRecPending(player) {
        ReplayCraft2B(player);
    }

    handleDefault(player) {
        ReplayCraft2A(player);
    }

    setState(newState) {
        this.state = this.states[newState] ? newState : "default";
    }

    handleEvent(player) {
        if (this.states[this.state]) {
            this.states[this.state](player);
        } else {
            this.handleDefault(player);
        }
    }
}

world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    console.log(`[DEBUG] Item Use Event - Source: ${player.name}, Item: ${event.itemStack?.typeId}`);
    if (event.itemStack?.["typeId"] === "minecraft:stick" && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(event.itemStack.nameTag)) {
        if (player === dbgRecController || !dbgRecController) {
            if (multiToggle === false) {
                multiPlayers = [];
                multiPlayers.push(player);
            }
        }
    }
});
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    console.log(`[DEBUG] Item Use Event (After) - Source: ${player.name}, Item: ${event.itemStack?.typeId}`);
    if (event.itemStack?.["typeId"] === "minecraft:stick" && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(event.itemStack.nameTag)) {
        if (player === dbgRecController || !dbgRecController) {
            //_0x276f50 is a player object.
            multiPlayers.forEach((multiplayer) => {
                if (!replayBDataMap.has(multiplayer.id)) {
                    replayBDataMap.set(multiplayer.id, {
                        dbgBlockData: {},
                    });
                    replayBDataBMap.set(multiplayer.id, {
                        dbgBlockDataB: {},
                    });
                    replayBData1Map.set(multiplayer.id, {
                        dbgBlockData1: {},
                    });
                    replayPosDataMap.set(multiplayer.id, {
                        dbgRecPos: [],
                    });
                    replayRotDataMap.set(multiplayer.id, {
                        dbgRecRot: [],
                    });
                    replayMDataMap.set(multiplayer.id, {
                        isSneaking: [],
                    });
                    replayODataMap.set(multiplayer.id, {
                        customEntity: undefined,
                    });
                    replaySDataMap.set(multiplayer.id, {
                        weapon1: [],
                        weapon2: [],
                        armor1: [],
                        armor2: [],
                        armor3: [],
                        armor4: [],
                    });
                }
            });
            replayStateMachine.handleEvent(player);
        } else {
            player.onScreenDisplay.setActionBar(dbgRecController.name + " is controlling the replay.");
        }
    }
});
const replayStateMachine = new ReplayStateMachine();
const replayBDataMap = new Map();
const replayBDataBMap = new Map();
const replayBData1Map = new Map();
const replayPosDataMap = new Map();
const replayRotDataMap = new Map();
const replayMDataMap = new Map();
const replayODataMap = new Map();
const replaySDataMap = new Map();
system.runInterval(() => {
    console.log(`[DEBUG] Replay State - State: ${replayStateMachine.state}, Time: ${dbgRecTime}, Tick: ${lilTick}`);
    if (replayStateMachine.state === "recPending") {
        dbgRecTime += 1;
    }
}, 1);
system.runInterval(() => {
    if (replayStateMachine.state === "viewStartRep") {
        if (lilTick >= dbgRecTime - 1) {
            replayStateMachine.setState("recSaved");
            multiPlayers.forEach((player) => {
                currentSwitch = false;
                clearStructure(player);
                const replayEntities = player.dimension.getEntities({
                    type: "dbg:replayentity",
                });
                replayEntities.forEach((entity) => {
                    entity.remove();
                });
            });
            lilTick = 0;
            return;
        }
        lilTick++;
    }
}, 1);

system.runInterval(() => {
    if (replayStateMachine.state === "recStartRep") {
        if (lilTick >= dbgRecTime - 1) {
            replayStateMachine.setState("recCompleted");

            multiPlayers.forEach((player) => {
                // Reset camera switches
                followCamSwitch = false;
                topDownCamSwitch = false;
                topDownCamSwitch2 = false;

                // Clear player camera and structures
                player.camera.clear();
                currentSwitch = false;
                clearStructure(player);

                // Remove replay entities
                const replayEntities = player.dimension.getEntities({
                    type: "dbg:replayentity",
                });
                replayEntities.forEach((entity) => {
                    entity.remove();
                });
            });

            // Reset lilTick
            lilTick = 0;
            return;
        }

        lilTick++;
    }
}, 1);

function playBlockSound(blockData) {
    if (toggleSound === false) {
        return;
    }

    const { location, typeId, states } = blockData;

    // Play sound at the block's location
    dbgRecController.playSound(soundIds[selectedSound], {
        position: location,
    });
}

system.runInterval(() => {
    multiPlayers.forEach((player) => {
        if (replayStateMachine.state === "viewStartRep" || replayStateMachine.state === "recStartRep") {
            if (lilTick <= dbgRecTime) {
                const replayBlockData = replayBDataMap.get(player.id);
                const replayObjectData = replayODataMap.get(player.id);

                if (replayBlockData && replayBlockData.dbgBlockData[lilTick]) {
                    const blockData = replayBlockData.dbgBlockData[lilTick];

                    if (blockData.lowerPart && blockData.upperPart) {
                        const { lowerPart, upperPart } = blockData;
                        const dimension = world.getDimension(player.dimension.id);

                        const lowerBlock = dimension.getBlock(lowerPart.location);
                        lowerBlock.setPermutation(BlockPermutation.resolve(lowerPart.typeId, lowerPart.states));

                        const upperBlock = dimension.getBlock(upperPart.location);
                        upperBlock.setPermutation(BlockPermutation.resolve(upperPart.typeId, upperPart.states));
                    } else {
                        if (blockData.thisPart && blockData.otherPart) {
                            const { thisPart, otherPart } = blockData;
                            const dimension = world.getDimension(player.dimension.id);

                            dimension.getBlock(thisPart.location).setPermutation(BlockPermutation.resolve(thisPart.typeId, thisPart.states));
                            dimension.getBlock(otherPart.location).setPermutation(BlockPermutation.resolve(otherPart.typeId, otherPart.states));
                        } else {
                            const { location, typeId, states } = blockData;

                            if (settReplayType === 0) {
                                replayObjectData.playAnimation("animation.replayentity.attack");
                            }

                            playBlockSound(blockData);

                            const dimension = world.getDimension(player.dimension.id);
                            const block = dimension.getBlock(location);
                            const blockPermutation = BlockPermutation.resolve(typeId, states);

                            block.setPermutation(blockPermutation);
                        }
                    }
                }
            }
        }
    });
}, 1);

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { player, block } = event;
    console.log(`[DEBUG] Block Break Event - Player: ${player.name}, Block: ${block.typeId}, Location: ${JSON.stringify(block.location)}`);

    if (replayStateMachine.state === "recPending") {
        if (!multiPlayers.includes(player)) {
            return;
        }

        if (block.typeId === "minecraft:bed" || twoPartBlocks.includes(block.type.id)) {
            if (block.typeId === "minecraft:bed") {
                saveBedParts(block, player);
            } else {
                saveDoorParts(block, player);
            }
        } else {
            const replayBlockData = replayBDataMap.get(player.id);
            replayBlockData.dbgBlockData[dbgRecTime] = {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates(),
            };
        }
    }
});

world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const { player, block } = event;
    console.log(`[DEBUG] Block Place Event - Player: ${player.name}, Block: ${block.typeId}, Location: ${JSON.stringify(block.location)}`);

    if (replayStateMachine.state === "recPending") {
        if (!multiPlayers.includes(player)) {
            return;
        }

        if (block.typeId === "minecraft:bed" || twoPartBlocks.includes(block.type.id)) {
            if (block.typeId === "minecraft:bed") {
                saveBedParts(block, player);
            } else {
                saveDoorParts(block, player);
            }
        } else {
            const replayBlockData = replayBDataMap.get(player.id);
            replayBlockData.dbgBlockData[dbgRecTime] = {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates(),
            };
        }
    }
});

function saveDoorParts(block, player) {
    console.log(`[DEBUG] Save Door Parts - Player: ${player.name}, Block: ${block.typeId}, Location: ${JSON.stringify(block.location)}`);

    // Get the state of the upper block bit from the block's permutation
    const upperBlockState = block.permutation.getState("upper_block_bit");

    if (!upperBlockState) {
        // Save the lower part of the door block
        const lowerBlock = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };

        // Determine the location of the upper block (one block above)
        const upperBlockLocation = {
            x: block.location.x,
            y: block.location.y + 1,
            z: block.location.z,
        };

        // Get the upper block from the dimension
        const upperBlockData = block.dimension.getBlock(upperBlockLocation);
        const upperBlock = {
            location: upperBlockLocation,
            typeId: upperBlockData.typeId,
            states: upperBlockData.permutation.getAllStates(),
        };

        // Save both parts of the door block for the player
        const replayBlockData = replayBDataMap.get(player.id);
        replayBlockData.dbgBlockData[dbgRecTime] = {
            lowerPart: lowerBlock,
            upperPart: upperBlock,
        };
    }
}

function saveBedParts(block, player) {
    console.log(`[DEBUG] Save Bed Parts - Player: ${player.name}, Block: ${block.typeId}, Location: ${JSON.stringify(block.location)}`);

    // Get the state of the head piece bit and the direction of the block
    const isHeadPiece = block.permutation.getState("head_piece_bit");
    const direction = block.permutation.getState("direction");

    // Initialize the position for the other part of the bed
    let otherPartLocation = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z,
    };

    // Adjust the location based on the direction and whether it's the head piece
    if (isHeadPiece) {
        switch (direction) {
            case 2: // North
                otherPartLocation.z += 1;
                break;
            case 0: // South
                otherPartLocation.z -= 1;
                break;
            case 3: // West
                otherPartLocation.x -= 1;
                break;
            case 1: // East
                otherPartLocation.x += 1;
                break;
        }
    } else {
        switch (direction) {
            case 2: // North
                otherPartLocation.z -= 1;
                break;
            case 0: // South
                otherPartLocation.z += 1;
                break;
            case 3: // West
                otherPartLocation.x += 1;
                break;
            case 1: // East
                otherPartLocation.x -= 1;
                break;
        }
    }

    // Get the other part of the bed from the dimension
    const otherPartBlock = block.dimension.getBlock(otherPartLocation);

    // If the other part is a valid block (not air), save both parts of the bed
    if (otherPartBlock && otherPartBlock.typeId !== "minecraft:air") {
        const otherPart = {
            location: otherPartLocation,
            typeId: otherPartBlock.typeId,
            states: otherPartBlock.permutation.getAllStates(),
        };

        const replayBlockData = replayBDataMap.get(player.id);
        replayBlockData.dbgBlockData[dbgRecTime] = {
            thisPart: {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates(),
            },
            otherPart: otherPart,
        };
    }
}

system.runInterval(() => {
    multiPlayers.forEach((player) => {
        if (replayStateMachine.state === "viewStartRep" || replayStateMachine.state === "recStartRep") {
            if (lilTick <= dbgRecTime) {
                const replayBlockData = replayBDataBMap.get(player.id);
                const replayEntityData = replayODataMap.get(player.id);
                const blockData = replayBlockData.dbgBlockDataB[lilTick];

                if (blockData) {
                    // Trigger animation if the replay type is set to 0
                    if (settReplayType === 0) {
                        replayEntityData.playAnimation("animation.replayentity.attack");
                    }

                    const dimension = world.getDimension(dbgRecController.dimension.id);

                    // Handle lower and upper parts of the block
                    if (blockData.lowerPart && blockData.upperPart) {
                        const { lowerPart, upperPart } = blockData;
                        const lowerBlock = dimension.getBlock(lowerPart.location);
                        lowerBlock.setPermutation(BlockPermutation.resolve(lowerPart.typeId, lowerPart.states));

                        const upperBlock = dimension.getBlock(upperPart.location);
                        upperBlock.setPermutation(BlockPermutation.resolve(upperPart.typeId, upperPart.states));
                    } else {
                        // Handle single part block
                        const { location, typeId, states } = blockData;
                        const block = dimension.getBlock(location);
                        const blockPermutation = BlockPermutation.resolve(typeId, states);
                        block.setPermutation(blockPermutation);
                    }
                }
            }
        }
    });
}, 1);

function saveDoorPartsB(block, player) {
    const isUpperBlock = block.permutation.getState("upper_block_bit");

    // If this is the lower part of the door
    if (!isUpperBlock) {
        const lowerPart = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };

        // Get the location for the upper part of the door
        const upperPartLocation = {
            x: block.location.x,
            y: block.location.y + 1,
            z: block.location.z,
        };

        const upperPartBlock = block.dimension.getBlock(upperPartLocation);
        const upperPart = {
            location: upperPartLocation,
            typeId: upperPartBlock.typeId,
            states: upperPartBlock.permutation.getAllStates(),
        };

        const replayData = replayBDataBMap.get(player.id);
        replayData.dbgBlockDataB[dbgRecTime] = {
            lowerPart: lowerPart,
            upperPart: upperPart,
        };
    }
}

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const { player, block } = event;
    console.log(`[DEBUG] Block Interact Event - Player: ${player.name}, Block: ${block.typeId}, Location: ${JSON.stringify(block.location)}`);

    // Handle block interaction only when in recPending state
    if (replayStateMachine.state === "recPending") {
        // Ensure the player is part of the multiPlayers list
        if (!multiPlayers.includes(player)) {
            return;
        }

        // Handle special two-part blocks like doors
        if (twoPartBlocks.includes(block.type.id)) {
            saveDoorPartsB(block, player);
        } else {
            // Save block data for regular blocks
            const replayData = replayBDataBMap.get(player.id);
            replayData.dbgBlockDataB[dbgRecTime] = {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates(),
            };
        }
    }
});

const twoPartBlocks = [
    "minecraft:copper_door",
    "minecraft:exposed_copper_door",
    "minecraft:weathered_copper_door",
    "minecraft:oxidized_copper_door",
    "minecraft:waxed_copper_door",
    "minecraft:waxed_exposed_copper_door",
    "minecraft:waxed_weathered_copper_door",
    "minecraft:waxed_oxidized_copper_door",
    "minecraft:acacia_door",
    "minecraft:bamboo_door",
    "minecraft:birch_door",
    "minecraft:cherry_door",
    "minecraft:crimson_door",
    "minecraft:dark_oak_door",
    "minecraft:iron_door",
    "minecraft:jungle_door",
    "minecraft:mangrove_door",
    "minecraft:spruce_door",
    "minecraft:warped_door",
    "minecraft:wooden_door",
    "minecraft:sunflower",
    "minecraft:double_plant",
    "minecraft:tall_grass",
    "minecraft:large_fern",
];
function clearStructure(player) {
    const replayData = replayBData1Map.get(player.id);
    if (!replayData || !replayData.dbgBlockData1) {
        return;
    }

    // Sort the keys in descending order (by tick)
    const sortedKeys = Object.keys(replayData.dbgBlockData1)
        .map(Number)
        .sort((a, b) => b - a);

    // Iterate through sorted keys and clear the structure
    for (const tick of sortedKeys) {
        const blockData = replayData.dbgBlockData1[tick];

        if (blockData.lowerPart) {
            // Handle blocks with both lower and upper parts (e.g., doors)
            const { location: lowerLocation, typeId: lowerType, states: lowerStates } = blockData.lowerPart;
            const { location: upperLocation, typeId: upperType, states: upperStates } = blockData.upperPart;

            const lowerBlock = player.dimension.getBlock(lowerLocation);
            lowerBlock.setPermutation(BlockPermutation.resolve(lowerType, lowerStates));

            const upperBlock = player.dimension.getBlock(upperLocation);
            upperBlock.setPermutation(BlockPermutation.resolve(upperType, upperStates));
        } else if (blockData.thisPart) {
            // Handle blocks with 'thisPart' and 'otherPart' (e.g., beds)
            const { thisPart, otherPart } = blockData;

            const thisPartBlock = player.dimension.getBlock(thisPart.location);
            thisPartBlock.setPermutation(BlockPermutation.resolve(thisPart.typeId, thisPart.states));

            const otherPartBlock = player.dimension.getBlock(otherPart.location);
            otherPartBlock.setPermutation(BlockPermutation.resolve(otherPart.typeId, otherPart.states));
        } else {
            // Handle single blocks
            const { location, typeId, states } = blockData;
            const singleBlock = player.dimension.getBlock(location);
            singleBlock.setPermutation(BlockPermutation.resolve(typeId, states));
        }
    }
}

function saveDoorParts1(block, player) {
    const isUpperBlock = block.permutation.getState("upper_block_bit");

    // If it's not an upper block (part of a door), save the lower and upper parts
    if (!isUpperBlock) {
        const lowerBlockData = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates(),
        };

        // Get the location of the upper part (1 block above the current block)
        const upperLocation = {
            x: block.location.x,
            y: block.location.y + 1,
            z: block.location.z,
        };
        const upperBlock = block.dimension.getBlock(upperLocation);
        const upperBlockData = {
            location: upperLocation,
            typeId: upperBlock.typeId,
            states: upperBlock.permutation.getAllStates(),
        };

        // Save the block data in the replay map
        const playerReplayData = replayBData1Map.get(player.id);
        playerReplayData.dbgBlockData1[dbgRecTime] = {
            lowerPart: lowerBlockData,
            upperPart: upperBlockData,
        };
    }
}

function saveBedParts1(block, player) {
    const isHeadPiece = block.permutation.getState("head_piece_bit");
    const direction = block.permutation.getState("direction");

    let otherPartLocation = { ...block.location };

    // Adjust location based on the bed direction
    if (isHeadPiece) {
        if (direction === 2) {
            otherPartLocation.z += 1;
        } else if (direction === 0) {
            otherPartLocation.z -= 1;
        } else if (direction === 3) {
            otherPartLocation.x -= 1;
        } else if (direction === 1) {
            otherPartLocation.x += 1;
        }
    } else {
        if (direction === 2) {
            otherPartLocation.z -= 1;
        } else if (direction === 0) {
            otherPartLocation.z += 1;
        } else if (direction === 3) {
            otherPartLocation.x += 1;
        } else if (direction === 1) {
            otherPartLocation.x -= 1;
        }
    }

    // Get the other part of the bed block
    const otherPartBlock = block.dimension.getBlock(otherPartLocation);

    if (otherPartBlock && otherPartBlock.typeId !== "minecraft:air") {
        const otherPartData = {
            location: otherPartLocation,
            typeId: otherPartBlock.typeId,
            states: otherPartBlock.permutation.getAllStates(),
        };

        // Save the bed block data in the replay map
        const playerReplayData = replayBData1Map.get(player.id);
        playerReplayData.dbgBlockData1[dbgRecTime] = {
            thisPart: {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates(),
            },
            otherPart: otherPartData,
        };
    }
}

world.beforeEvents.playerBreakBlock.subscribe((event) => {
    if (replayStateMachine.state === "recPending") {
        const { player, block } = event;

        // Only process blocks for players in the multiPlayers list
        if (!multiPlayers.includes(player)) {
            return;
        }

        // Handle specific block types: bed or two-part blocks (like doors)
        if (block.typeId === "minecraft:bed") {
            saveBedParts1(block, player); // Save bed part data
        } else if (twoPartBlocks.includes(block.type.id)) {
            saveDoorParts1(block, player); // Save door part data
        } else {
            // Handle generic block breaks, storing block location and state
            const playerData = replayBData1Map.get(player.id);
            playerData.dbgBlockData1[dbgRecTime] = {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates(),
            };
        }
    }
});

world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    if (replayStateMachine.state === "recPending") {
        const { player, block } = event;

        // Only process blocks for players in the multiPlayers list
        if (!multiPlayers.includes(player)) {
            return;
        }

        // Handle specific block types: bed or two-part blocks (like doors)
        if (block.typeId === "minecraft:bed") {
            saveBedParts1(block, player); // Save bed part data
        } else if (twoPartBlocks.includes(block.type.id)) {
            saveDoorParts1(block, player); // Save door part data
        } else {
            // Handle generic block placements, storing block location and state
            const playerData = replayBData1Map.get(player.id);
            playerData.dbgBlockData1[dbgRecTime] = {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates(),
            };
        }
    }
});

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    if (replayStateMachine.state === "recPending") {
        const { player, block } = event;

        // Only process interactions for players in the multiPlayers list
        if (!multiPlayers.includes(player)) {
            return;
        }

        // Handle two-part blocks like doors
        if (twoPartBlocks.includes(block.type.id)) {
            saveDoorParts1(block, player); // Save door part data
        } else {
            // Handle generic block interactions, storing block location and state
            const playerData = replayBData1Map.get(player.id);
            playerData.dbgBlockData1[dbgRecTime] = {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates(),
            };
        }
    }
});

system.runInterval(() => {
    // Iterate over all players in the multiPlayers list
    multiPlayers.forEach((player) => {
        // Only record if the replay state is "recPending"
        if (replayStateMachine.state !== "recPending") {
            return;
        }

        // Get the position and rotation data for the player
        const playerPosData = replayPosDataMap.get(player.id);
        const playerRotData = replayRotDataMap.get(player.id);

        // If no position data exists for the player, skip the iteration
        if (!playerPosData) {
            return;
        }

        // Get the player's current position and rotation
        const currentPosition = player.location;
        const currentRotation = player.getRotation();

        // Push the position and rotation data into the respective arrays for recording
        playerPosData.dbgRecPos.push(currentPosition);
        playerRotData.dbgRecRot.push(currentRotation);
    });
}, 1);

function summonReplayEntity(player) {
    // Retrieve the player's position data from replayPosDataMap
    const playerPosData = replayPosDataMap.get(player.id);

    // If no position data is found, return early
    if (!playerPosData) {
        return;
    }

    // Define a variable for the spawned entity
    let replayEntity;

    // If replay type is 0, spawn the replay entity
    if (settReplayType === 0) {
        // Spawn entity at the first position recorded
        replayEntity = player.dimension.spawnEntity("dbg:replayentity", playerPosData.dbgRecPos[0]);

        // Set the entity's skin to the chosen replay skin
        replayEntity.setProperty("dbg:skin", choosenReplaySkin);

        // Set the entity's name based on settNameType
        switch (settNameType) {
            case 0:
            case 1:
                replayEntity.nameTag = player.name;
                break;
            case 2:
                replayEntity.nameTag = settCustomName;
                break;
            default:
                replayEntity.nameTag = player.name; // Default to player's name
                break;
        }

        // Store the entity in the replayODataMap with player ID as the key
        replayODataMap.set(player.id, replayEntity);
    }
}

system.runInterval(() => {
    multiPlayers.forEach((player) => {
        // Check if replay is in start view or start recording state
        if (replayStateMachine.state === "viewStartRep" || replayStateMachine.state === "recStartRep") {
            // Get the replay entity, position, and rotation data for the player
            const replayEntity = replayODataMap.get(player.id);
            const positionData = replayPosDataMap.get(player.id);
            const rotationData = replayRotDataMap.get(player.id);

            // If no position data exists, return early
            if (!positionData) {
                return;
            }

            // Only proceed if the replay type is 0
            if (settReplayType === 0) {
                // Teleport the replay entity to the recorded position and rotation at the current tick
                replayEntity.teleport(positionData.dbgRecPos[lilTick], {
                    rotation: rotationData.dbgRecRot[lilTick],
                });
            }
        }
    });
}, 1);

system.runInterval(() => {
    multiPlayers.forEach((player) => {
        // Check if the replay is in the 'recPending' state
        if (replayStateMachine.state !== "recPending") {
            return;
        }

        // Get the player’s replay data from replayMDataMap
        const playerData = replayMDataMap.get(player.id);
        if (!playerData) {
            return;
        }

        // Record the player's sneaking state (1 if sneaking, 0 if not)
        playerData.isSneaking.push(player.isSneaking ? 1 : 0);
    });
}, 1);

system.runInterval(() => {
    // Check if the replay type is 0 (otherwise, exit early)
    if (settReplayType !== 0) {
        return;
    }

    multiPlayers.forEach((player) => {
        // Only proceed if the replay is either starting or in view mode
        if (replayStateMachine.state === "viewStartRep" || replayStateMachine.state === "recStartRep") {
            const playerData = replayMDataMap.get(player.id);
            const playerObject = replayODataMap.get(player.id);

            // If player data is not available, skip
            if (!playerData) {
                return;
            }

            // Set the player's sneaking state based on the recorded data
            playerObject.isSneaking = playerData.isSneaking[lilTick] === 1;
        }
    });
}, 1);

system.runInterval(() => {
    // Loop over each player in the multiPlayers array
    multiPlayers.forEach((player) => {
        // Proceed only if the state is 'recPending' (indicating that recording is pending)
        if (replayStateMachine.state !== "recPending") {
            return;
        }

        // Retrieve the player's equipment data from replaySDataMap
        const playerData = replaySDataMap.get(player.id);
        if (!playerData) {
            return; // If no data is found, skip to the next player
        }

        // Retrieve and store the player's equipment (mainhand, offhand, armor slots)
        const equippableComponent = player.getComponent("minecraft:equippable");

        playerData.weapon1.push(equippableComponent.getEquipment("Mainhand")?.["typeId"] || "air");
        playerData.weapon2.push(equippableComponent.getEquipment("Offhand")?.["typeId"] || "air");
        playerData.armor1.push(equippableComponent.getEquipment("Head")?.["typeId"] || "air");
        playerData.armor2.push(equippableComponent.getEquipment("Chest")?.["typeId"] || "air");
        playerData.armor3.push(equippableComponent.getEquipment("Legs")?.["typeId"] || "air");
        playerData.armor4.push(equippableComponent.getEquipment("Feet")?.["typeId"] || "air");
    });
}, 1);

system.runInterval(() => {
    // Only proceed if the replay type is 0
    if (settReplayType !== 0) {
        return;
    }

    // Loop through each player in the multiPlayers array
    multiPlayers.forEach((player) => {
        // Proceed if the replay state is either 'viewStartRep' or 'recStartRep'
        if (replayStateMachine.state === "viewStartRep" || replayStateMachine.state === "recStartRep") {
            const playerData = replaySDataMap.get(player.id); // Retrieve the player's data
            const playerEntity = replayODataMap.get(player.id); // Retrieve the player's entity

            // If no data is found, skip the player
            if (!playerData) {
                return;
            }

            // Replace the items in the player's equipment slots using the stored data
            playerEntity.runCommand("replaceitem entity @s slot.weapon.mainhand 0 " + playerData.weapon1[lilTick]);
            playerEntity.runCommand("replaceitem entity @s slot.weapon.offhand 0 " + playerData.weapon2[lilTick]);
            playerEntity.runCommand("replaceitem entity @s slot.armor.head 0 " + playerData.armor1[lilTick]);
            playerEntity.runCommand("replaceitem entity @s slot.armor.chest 0 " + playerData.armor2[lilTick]);
            playerEntity.runCommand("replaceitem entity @s slot.armor.legs 0 " + playerData.armor3[lilTick]);
            playerEntity.runCommand("replaceitem entity @s slot.armor.feet 0 " + playerData.armor4[lilTick]);
        }
    });
}, 1);

function loadEntity(player) {
    const positionData = replayPosDataMap.get(player.id);
    const rotationData = replayRotDataMap.get(player.id);
    let entity;

    try {
        // Try to load the position and rotation at the current frame tick (wantLoadFrameTick)
        const frameTick = Math.min(wantLoadFrameTick, positionData.dbgRecPos.length - 1);
        entity = player.dimension.spawnEntity("dbg:replayentity", positionData.dbgRecPos[frameTick]);
        entity.setRotation(rotationData.dbgRecRot[frameTick]);
    } catch (error) {
        // If there's an error, load the last available position and rotation
        entity = player.dimension.spawnEntity("dbg:replayentity", positionData.dbgRecPos[positionData.dbgRecPos.length - 1]);
        entity.setRotation(rotationData.dbgRecRot[rotationData.dbgRecRot.length - 1]);
    }

    // Set the entity's name tag to the player's name
    entity.nameTag = player.name;
}

function loadBlocksUpToTick(tick, player) {
    const blockData = replayBDataMap.get(player.id);
    const dimension = world.getDimension(dbgRecController.dimension.id);

    for (let i = 0; i <= tick; i++) {
        const blockInfo = blockData.dbgBlockData[i];
        if (blockInfo) {
            if (blockInfo.lowerPart && blockInfo.upperPart) {
                const { lowerPart, upperPart } = blockInfo;
                setBlock(lowerPart);
                setBlock(upperPart);
            } else if (blockInfo.thisPart && blockInfo.otherPart) {
                const { thisPart, otherPart } = blockInfo;
                setBlock(thisPart);
                setBlock(otherPart);
            } else {
                const { location, typeId, states } = blockInfo;
                setBlock({ location, typeId, states });
            }
        }
    }

    // Helper function to set the block permutation
    function setBlock(blockPart) {
        const block = dimension.getBlock(blockPart.location);
        block.setPermutation(BlockPermutation.resolve(blockPart.typeId, blockPart.states));
    }
}
function loadFrameTicksForm(player) {
    const modal = new mcUI.ModalFormData().title("Load Frames - Ticks");

    // Set up the slider for selecting the frame
    modal.slider("This is the most accurate way of loading frames.\n\nSelect Frame (Ticks)", startingValueTick, dbgRecTime, 1, wantLoadFrameTick);

    modal.show(player).then((response) => {
        if (response.canceled || !response.formValues) {
            return;
        }

        // Update the frame tick value
        wantLoadFrameTick = response.formValues[0];

        // Remove all replay entities from the dimension
        const entities = player.dimension.getEntities({ type: "dbg:replayentity" });
        entities.forEach((entity) => entity.remove());

        // Clear structures for each player
        multiPlayers.forEach(clearStructure);

        // Set frame loaded status to true
        frameLoaded = true;

        // Load entities and blocks for each player
        multiPlayers.forEach((player) => {
            loadEntity(player);
            loadBlocksUpToTick(wantLoadFrameTick, player);
        });
    });
}

function loadFrameSecondsForm(player) {
    const maxFrameSeconds = Math.floor(dbgRecTime / 20);
    const totalTicks = dbgRecTime;
    const form = new mcUI.ModalFormData()
        .title("Load Frames - Seconds")
        .slider(`These values are slightly rounded off.\n§bAccurate time: §r${(Math.round((dbgRecTime / 20) * 100) / 100).toFixed(2)}\n\nSelect Frame (Secs)`, startingValueSecs, maxFrameSeconds, 1, Math.floor(wantLoadFrameTick / 20));

    form.show(player).then((response) => {
        if (response.canceled || !response.formValues) return;

        const selectedSeconds = response.formValues[0];
        wantLoadFrameTick = Math.round((selectedSeconds / maxFrameSeconds) * totalTicks);

        const replayEntities = player.dimension.getEntities({ type: "dbg:replayentity" });
        replayEntities.forEach((entity) => entity.remove());

        multiPlayers.forEach((player) => clearStructure(player));
        frameLoaded = true;

        multiPlayers.forEach((player) => {
            loadEntity(player);
            loadBlocksUpToTick(wantLoadFrameTick, player);
        });
    });
}
function addPos(player) {
    if (!frameLoaded) {
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.please.load.a.frame.before.adding.camera.point" }],
            });
        }
        if (soundCue) player.playSound("note.bass");
        return;
    }

    const existingPoint = replayCamPos.find((pos) => pos.tick === wantLoadFrameTick);
    if (existingPoint) {
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.a.camera.point.already.exists.at.this.tick" }],
            });
        }
        if (soundCue) player.playSound("note.bass");
        return;
    }

    frameLoaded = true;
    startingValueTick = wantLoadFrameTick;
    startingValueSecs = Math.floor(wantLoadFrameTick / 20);

    const { x, y, z } = player.location;
    const rotationX = player.getRotation().x;
    const rotationY = player.getRotation().y;

    const cameraPosition = { x, y: y + 1.8, z };
    const positionString = `${x} ${y + 1.8} ${z}`;
    const rotationString = `${rotationX} ${rotationY}`;

    replayCamPos.push({ position: positionString, tick: wantLoadFrameTick });
    replayCamRot.push({ rotation: rotationString, tick: wantLoadFrameTick });

    const cameraEntity = player.dimension.spawnEntity("dbg:rccampos", cameraPosition);
    cameraEntity.nameTag = `Camera Point ${replayCamPos.length}`;

    if (textPrompt) {
        player.onScreenDisplay.setActionBar(`§bCamera point added successfully at about ${Math.round(wantLoadFrameTick / 20)} second(s).`);
    }
}
const repCamTout1Map = new Map();
const repCamTout2Map = new Map();

function startReplayCam(player) {
    if (settCameraType === 0) {
        return;
    }

    // Initialize timeout maps for the player
    repCamTout1Map.set(player.id, []);
    repCamTout2Map.set(player.id, []);

    // Handle different camera types
    switch (settCameraType) {
        case 1:
            handleCameraType1(player);
            break;
        case 2:
            handleCameraType2(player);
            break;
        case 3:
            handleCameraType3(player);
            break;
        case 4:
            handleCameraType4(player);
            break;
        default:
            break;
    }
}

function handleCameraType1(player) {
    if (replayCamPos.length === 0) {
        displayNoCameraPointsMessage(player);
        return;
    }

    const easeType = easeTypesCom[replayCamEase];
    const firstCamPos = replayCamPos[0];
    const firstCamRot = replayCamRot[0];
    const firstTick = firstCamPos.tick;

    // Set initial camera position and rotation
    const firstTimeout = system.runTimeout(() => {
        player.runCommand("camera @s set minecraft:free pos " + firstCamPos.position + " rot " + firstCamRot.rotation);
    }, firstTick);
    repCamTout1Map.get(player.id).push(firstTimeout);

    // Set subsequent camera positions and rotations with easing
    for (let i = 0; i < replayCamPos.length - 1; i++) {
        const currentPos = replayCamPos[i];
        const nextPos = replayCamPos[i + 1];
        const nextRot = replayCamRot[i + 1];
        const tickDifference = nextPos.tick - currentPos.tick;
        const easeDuration = tickDifference / 20;

        const timeout = system.runTimeout(() => {
            player.runCommand("camera @s set minecraft:free ease " + easeDuration + " " + easeType + " pos " + nextPos.position + " rot " + nextRot.rotation);
        }, currentPos.tick);
        repCamTout2Map.get(player.id).push(timeout);
    }
}

function handleCameraType2(player) {
    if (settReplayType === 1) return;

    if (replayCamPos.length === 0) {
        displayNoCameraPointsMessage(player, true);
        return;
    }

    const firstCamPos = replayCamPos[0];
    const firstCamRot = replayCamRot[0];
    const firstTick = firstCamPos.tick;

    // Set camera position and rotation for follow camera
    const timeout = system.runTimeout(() => {
        player.runCommand("camera @s set minecraft:free pos " + firstCamPos.position + " rot " + firstCamRot.rotation);
        followCamSwitch = true;
    }, firstTick);
    repCamTout1Map.get(player.id).push(timeout);
}

function handleCameraType3(player) {
    if (settReplayType === 1) return;

    const firstCamPos = replayCamPos[0];
    const firstTick = firstCamPos.tick;

    // Switch to top-down camera
    const timeout = system.runTimeout(() => {
        topDownCamSwitch = true;
    }, firstTick);
    repCamTout1Map.get(player.id).push(timeout);
}

function handleCameraType4(player) {
    if (settReplayType === 1) return;

    const firstCamPos = replayCamPos[0];
    const firstTick = firstCamPos.tick;

    // Switch to another top-down camera
    const timeout = system.runTimeout(() => {
        topDownCamSwitch2 = true;
    }, firstTick);
    repCamTout1Map.get(player.id).push(timeout);
}

function displayNoCameraPointsMessage(player, isType2 = false) {
    const messageKey = isType2 ? "dbg.rc1.mes.no.camera.points.found.add.atleast.one.camera.point" : "dbg.rc1.mes.no.camera.points.found";
    if (textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [
                {
                    translate: messageKey,
                },
            ],
        });
    }
    if (soundCue) {
        player.playSound("note.bass");
    }
}

system.runInterval(() => {
    if (followCamSwitch) {
        dbgCamAffectPlayer.forEach((player) => {
            const cameraPosition = getCameraPositionForPlayer(dbgCamFocusPlayer.id);
            setCameraForPlayer(player, cameraPosition, { easeTime: 0.4, easeType: EasingType.Linear });
        });
    }

    if (topDownCamSwitch) {
        dbgCamAffectPlayer.forEach((player) => {
            const cameraPosition = getCameraPositionForPlayer(dbgCamFocusPlayer.id, topDownCamHight);
            setCameraForPlayer(player, cameraPosition, { rotation: { x: 90, y: 0 }, easeTime: 0.4, easeType: EasingType.Linear });
        });
    }

    if (topDownCamSwitch2) {
        dbgCamAffectPlayer.forEach((player) => {
            const cameraData = getCameraDataForPlayer(dbgCamFocusPlayer.id, topDownCamHight);
            setCameraForPlayer(player, cameraData.location, {
                rotation: cameraData.rotation,
                easeTime: 0.4,
                easeType: EasingType.Linear,
            });
        });
    }
}, 1);

function getCameraPositionForPlayer(playerId, heightOffset = 1.5) {
    const { x, y, z } = replayODataMap.get(playerId).location;
    return {
        x,
        y: y + heightOffset,
        z,
    };
}

function getCameraDataForPlayer(playerId, heightOffset = 1.5) {
    const playerData = replayODataMap.get(playerId);
    const { x, y, z } = playerData.location;
    const { xRot, yRot } = playerData.getRotation();
    return {
        location: { x, y: y + heightOffset, z },
        rotation: { x: 90, y: yRot },
    };
}

function setCameraForPlayer(player, location, options) {
    player.camera.setCamera("minecraft:free", {
        location,
        rotation: options.rotation || { x: 0, y: 0 },
        easeOptions: {
            easeTime: options.easeTime,
            easeType: options.easeType,
        },
    });
}

function ReplayCraft2A(player) {
    const form = new mcUI.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.start.recording")
        .button("dbg.rc1.button.settings")
        .button("dbg.rc1.button.multiplayer.settings")
        .button("dbg.rc1.button.important.info")
        .body("dbg.rc1.body.2a");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }

        const actions = [() => doStart(player), () => mainSettings(player), () => multiplayerSett(player), () => rcInfo(player)];

        const selectedAction = actions[response.selection];
        if (selectedAction) {
            selectedAction();
        }
    });
}

function ReplayCraft2B(player) {
    const form = new mcUI.ActionFormData().title("dbg.rc1.title.replay.menu").button("dbg.rc1.button.save.recording").button("dbg.rc1.button.pause.recording").button("dbg.rc1.button.cancel.recording").body("dbg.rc1.body.2b");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }

        const actions = [() => doSave(player), () => doPause(player), () => cancelRec(player)];

        const selectedAction = actions[response.selection];
        if (selectedAction) {
            selectedAction();
        }
    });
}

function ReplayCraft2C(player) {
    const form = new mcUI.ActionFormData().title("dbg.rc1.title.replay.menu").button("dbg.rc1.button.save.recording").button("dbg.rc1.button.resume.recording").button("dbg.rc1.button.cancel.recording").body("dbg.rc1.body.2c");

    form.show(player).then((response) => {
        if (response.canceled) {
            return;
        }

        const actions = [() => doSave(player), () => doResume(player), () => cancelRec(player)];

        const selectedAction = actions[response.selection];
        if (selectedAction) {
            selectedAction();
        }
    });
}

function ReplayCraft2D(player) {
    const form = new mcUI.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.preview.replay")
        .button("dbg.rc1.button.stop.preview")
        .button("dbg.rc1.button.preview.settings")
        .button("dbg.rc1.button.start.camera.setup")
        .button("dbg.rc1.button.cancel.recording")
        .body("dbg.rc1.body.2d");

    form.show(player).then((result) => {
        if (result.canceled) {
            return;
        }

        const actions = [() => doViewReplay(player), () => doStopPreview(player), () => previewSettings(player), () => doCamSetup(player), () => cancelRec(player)];

        const selectedAction = actions[result.selection];
        if (selectedAction) {
            selectedAction();
        }
    });
}

function ReplayCraft2E(player) {
    const form = new mcUI.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.load.frame.t")
        .button("dbg.rc1.button.load.frame.s")
        .button("dbg.rc1.button.add.camera.point")
        .button("dbg.rc1.button.proceed.further")
        .button("dbg.rc1.button.reset.camera.setup")
        .button("dbg.rc1.button.cancel.recording")
        .body("dbg.rc1.body.2e");

    form.show(player).then((result) => {
        if (result.canceled) {
            return;
        }

        const actions = [() => loadFrameTicksForm(player), () => loadFrameSecondsForm(player), () => addPos(player), () => doProceedFurther(player), () => resetCamSetup(player), () => cancelRec(player)];

        const selectedAction = actions[result.selection];
        if (selectedAction) {
            selectedAction();
        }
    });
}

function ReplayCraft2F(player) {
    const form = new mcUI.ActionFormData()
        .title("dbg.rc1.title.replay.menu")
        .button("dbg.rc1.button.start.replay")
        .button("dbg.rc1.button.stop.replay")
        .button("dbg.rc1.button.settings")
        .button("dbg.rc1.button.goback.camsetup")
        .button("dbg.rc1.button.load.structure.or.reset")
        .body("dbg.rc1.body.2f");

    form.show(player).then((result) => {
        if (result.canceled) {
            return;
        }

        const actions = [() => doReplay(player), () => doStopReplay(player), () => replaySettings(player), () => doCamSetupGoBack(player), () => cancelRec(player)];

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
                rawtext: [{ translate: "dbg.rc1.mes.please.wait.for.replay.to.be.completed" }],
            });
        }
        if (soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    const playerNames = multiPlayers.map((player) => player.name);
    const form = new mcUI.ModalFormData()
        .title("dbg.rc1.title.replay.settings")
        .dropdown("dbg.rc1.dropdown.title.replay.type", ["Default Replay", "Ghost Replay"], settReplayType)
        .dropdown("dbg.rc1.dropdown.title.replay.skin.type", skinTypes, choosenReplaySkin)
        .dropdown("dbg.rc1.dropdown.title.name.of.replay.player", ["Disable", "Player's Name", "Custom Name"], settNameType)
        .textField("dbg.rc1.textfield.custom.name", settCustomName)
        .dropdown("dbg.rc1.dropdown.title.camera.ease.type", easeTypes, replayCamEase)
        .dropdown("dbg.rc1.dropdown.title.camera.type", ["None (Free Cam)", "Cinematic Cam", "Focus Cam", "Top-Down Focus (Fixed)", "Top-Down Focus (Dynamic)"], settCameraType)
        .dropdown("dbg.rc1.dropdown.title.focus.on.player", playerNames, focusPlayerSelection)
        .dropdown("dbg.rc1.dropdown.title.affect.camera.of.players", ["All Players", ...playerNames], affectCameraSelection)
        .slider("drop.title.topdown.cam.height", 2, 20, 1, topDownCamHight);

    form.show(player).then((result) => {
        if (result.canceled) {
            if (textPrompt) {
                player.onScreenDisplay.setActionBar({
                    rawtext: [{ translate: "dbg.rc1.mes.please.click.submit" }],
                });
            }
            if (soundCue) {
                player.playSound("note.bass");
            }
            return;
        }

        settReplayType = result.formValues[0];
        choosenReplaySkin = result.formValues[1];
        settNameType = result.formValues[2];
        settCustomName = result.formValues[3];
        replayCamEase = result.formValues[4];
        settCameraType = result.formValues[5];
        focusPlayerSelection = result.formValues[6];
        dbgCamFocusPlayer = multiPlayers[focusPlayerSelection];
        affectCameraSelection = result.formValues[7];

        if (affectCameraSelection === 0) {
            dbgCamAffectPlayer = multiPlayers;
        } else {
            dbgCamAffectPlayer = [multiPlayers[affectCameraSelection - 1]];
        }

        topDownCamHight = result.formValues[8];
    });
}

function previewSettings(player) {
    if (currentSwitch === true) {
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.wait.for.replay.preview.end" }],
            });
        }
        if (soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    const form = new mcUI.ModalFormData()
        .title("dbg.rc1.title.preview.settings")
        .dropdown("dbg.rc1.dropdown.title.preview.type", ["Default Preview", "Ghost Preview"], settReplayType)
        .dropdown("dbg.rc1.dropdown.title.preview.skin.type", skinTypes, choosenReplaySkin)
        .dropdown("dbg.rc1.dropdown.title.name.of.preview.player", ["Disable", "Player's Name", "Custom Name"], settNameType)
        .textField("dbg.rc1.textfield.title.custom.name", settCustomName);

    form.show(player).then((result) => {
        if (result.canceled) {
            if (textPrompt) {
                player.onScreenDisplay.setActionBar({
                    rawtext: [{ translate: "dbg.rc1.mes.please.click.submit" }],
                });
            }
            if (soundCue) {
                player.playSound("note.bass");
            }
            return;
        }

        settReplayType = result.formValues[0];
        choosenReplaySkin = result.formValues[1];
        settNameType = result.formValues[2];
        settCustomName = result.formValues[3];
    });
}

function mainSettings(player) {
    const form = new mcUI.ModalFormData()
        .title("dbg.rc1.title.replaycraft.settings")
        .toggle("dbg.rc1.toggle.sound.cues", soundCue)
        .toggle("dbg.rc1.toggle.text.prompts", textPrompt)
        .dropdown("dbg.rc1.dropdown.select.block.placing.sound", soundIds, selectedSound)
        .toggle("dbg.rc1.toggle.block.placing.sound", toggleSound);

    form.show(player).then((result) => {
        if (result.canceled) {
            if (textPrompt) {
                player.onScreenDisplay.setActionBar({
                    rawtext: [{ translate: "dbg.rc1.mes.please.click.submit" }],
                });
            }
            player.playSound("note.bass");
            return;
        }

        soundCue = result.formValues[0];
        textPrompt = result.formValues[1];
        selectedSound = result.formValues[2];
        toggleSound = result.formValues[3];
    });
}

function multiplayerSett(player) {
    const players = world.getPlayers();

    // Handle the case when there is only one player
    if (players.length === 1) {
        multiPlayers = [player];
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.no.other.players.available" }],
            });
        }
        player.playSound("note.bass");
        return;
    }

    // Create a list of available players
    const playerList = players.map((player, index) => `${index + 1}. ${player.name}`).join("\n");

    // Create the modal form with available players and settings
    const form = new mcUI.ModalFormData().title("dbg.rc1.title.multiplayer.settings").toggle("dbg.rc1.toggle.multiplayer.replay", multiToggle).slider(`\nAvailable Players\n${playerList}\n\nSelected Players`, 1, players.length, 1, 1);

    form.show(player).then((result) => {
        if (result.canceled) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.please.click.submit" }],
            });
            player.playSound("note.bass");
            return;
        }

        // Check if the player selected more than one player
        if (result.formValues[1] === 1) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.you.have.to.select.multiple.players" }],
            });
            player.playSound("note.bass");
            return;
        }

        // Update multiplayer settings based on user input
        multiToggle = result.formValues[0];

        if (multiToggle === true) {
            multiPlayers = [];
            const selectedCount = result.formValues[1];
            for (let i = 0; i < selectedCount; i++) {
                multiPlayers.push(players[i]);
            }
            player.onScreenDisplay.setActionBar(`§aAdded ${selectedCount} players to multiplayer replay.`);
            player.playSound("note.pling");
        } else {
            multiPlayers = [player];
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.multiplayer.replay.is.off" }],
            });
        }
    });
}

function doStart(player) {
    // Reset all players before starting
    multiPlayers.forEach((currentPlayer) => {
        removeEntities(currentPlayer);
        resetRec(currentPlayer);
    });

    // Set the replay state to "recPending"
    replayStateMachine.setState("recPending");

    // Set the controller for the recording
    dbgRecController = player;

    // Determine camera focus based on multiplayer toggle
    if (multiToggle === false) {
        dbgCamFocusPlayer = dbgRecController;
        dbgCamAffectPlayer[0] = dbgRecController;
    }
    if (multiToggle === true) {
        dbgCamAffectPlayer = multiPlayers;
    }

    // Show a prompt to the player that the recording has started
    if (textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [{ translate: "dbg.rc1.mes.rec.has.started" }],
        });
    }
}

function doResume(player) {
    // Set the replay state to "recPending" when resuming
    replayStateMachine.setState("recPending");

    // Set the recording controller to the passed player
    dbgRecController = player;

    // Show a success message if text prompts are enabled
    if (textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [{ translate: "dbg.rc1.mes.rec.resumed.successfully" }],
        });
    }
}

function doPause(player) {
    // Set the replay state to "recPaused" when pausing
    replayStateMachine.setState("recPaused");

    // Show a success message if text prompts are enabled
    if (textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [{ translate: "dbg.rc1.mes.rec.paused.successfully" }],
        });
    }
}

function doSave(player) {
    // Set the replay state to "recSaved" after saving
    replayStateMachine.setState("recSaved");

    // Show a success message if text prompts are enabled
    if (textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [{ translate: "dbg.rc1.mes.rec.saved.successfully" }],
        });
    }

    // Clear the structure for each player in the multiplayer list
    multiPlayers.forEach((multiplayerPlayer) => {
        clearStructure(multiplayerPlayer);
    });
}

function doViewReplay(player) {
    // Check if the replay preview is already active
    if (currentSwitch === true) {
        // Show a message if text prompts are enabled
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.replay.preview.is.already.on" }],
            });
        }
        // Play a sound cue if enabled
        if (soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    // Set the replay state to "viewStartRep"
    replayStateMachine.setState("viewStartRep");

    // Summon replay entities for each player in the multiplayer list
    multiPlayers.forEach((multiplayerPlayer) => {
        summonReplayEntity(multiplayerPlayer);
    });

    // Set currentSwitch to true, indicating the replay preview is now active
    currentSwitch = true;
}

function doStopPreview(player) {
    // Check if the replay preview is currently active
    if (currentSwitch === true) {
        // Display a message if text prompts are enabled
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.replay.preview.has.stopped.successfully" }],
            });
        }

        // Set the replay state to "recSaved"
        replayStateMachine.setState("recSaved");

        // Remove replay data and clear structures for all players
        multiPlayers.forEach((multiplayerPlayer) => {
            const replayData = replayODataMap.get(multiplayerPlayer.id);
            replayData.remove();
            clearStructure(multiplayerPlayer);
        });

        // Reset tick counter and set the currentSwitch to false
        lilTick = 0;
        currentSwitch = false;

        return;
    }

    // If the replay preview is not active, show a message
    if (textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [{ translate: "dbg.rc1.mes.replay.preview.is.already.off" }],
        });
    }

    // Play a sound cue if enabled
    if (soundCue) {
        player.playSound("note.bass");
    }
}

function doCamSetup(player) {
    // Check if a replay is in progress
    if (currentSwitch === true) {
        // Display a message prompting the player to wait for the replay preview to complete
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.please.wait.for.replay.prev.to.be.completed" }],
            });
        }

        // Play a sound cue if enabled
        if (soundCue) {
            player.playSound("note.bass");
        }

        return;
    }

    // Set the replay state to "recCamSetup"
    replayStateMachine.setState("recCamSetup");

    // Display a message prompting the player to do the cinematic camera setup
    if (textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [{ translate: "dbg.rc1.mes.please.do.the.cinematic.camera.setup" }],
        });
    }

    // Play a sound cue if enabled
    if (soundCue) {
        player.playSound("random.orb");
    }
}

function doCamSetupGoBack(player) {
    // Check if a replay is in progress
    if (currentSwitch === true) {
        // Display a message prompting the player to wait for the replay to complete
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.please.wait.for.replay.to.be.completed" }],
            });
        }

        // Play a sound cue if enabled
        if (soundCue) {
            player.playSound("note.bass");
        }

        return;
    }

    // Set the replay state to "recCamSetup"
    replayStateMachine.setState("recCamSetup");

    // Reset the camera position and rotation
    replayCamPos = [];
    replayCamRot = [];
    wantLoadFrameTick = 0;

    // Display a message prompting the player to do the cinematic camera setup
    if (textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [{ translate: "dbg.rc1.mes.please.do.the.cinematic.camera.setup" }],
        });
    }
}

function doProceedFurther(player) {
    // Check if there are at least two camera points
    if (replayCamPos.length <= 1) {
        // Display a message to the player indicating that at least two camera points are recommended
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.at.least.two.camera.points.are.recommended" }],
            });
        }

        // Play a sound cue if enabled
        if (soundCue) {
            player.playSound("note.bass");
        }

        return;
    }

    // Set the replay state to "recCompleted"
    replayStateMachine.setState("recCompleted");

    // Clear structures for all players
    multiPlayers.forEach((multiPlayer) => {
        clearStructure(multiPlayer);
    });

    // Remove all replay entities from the dimension
    const replayEntities = player.dimension.getEntities({ type: "dbg:replayentity" });
    replayEntities.forEach((entity) => {
        entity.remove();
    });

    // Remove all camera positions (dbg:rccampos) from the dimension
    const cameraPositions = player.dimension.getEntities({ type: "dbg:rccampos" });
    cameraPositions.forEach((camera) => {
        camera.remove();
    });
}

function doReplay(player) {
    // Check if a replay is already in progress
    if (currentSwitch === true) {
        // Display a message indicating that a replay is already in progress
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [{ translate: "dbg.rc1.mes.replay.is.already.in.progress" }],
            });
        }

        // Play a sound cue if enabled
        if (soundCue) {
            player.playSound("note.bass");
        }

        return;
    }

    // Set the replay state to "recStartRep" and indicate that the replay has started
    replayStateMachine.setState("recStartRep");
    currentSwitch = true;

    // Start the replay camera for all players affected by the camera
    dbgCamAffectPlayer.forEach((affectedPlayer) => {
        startReplayCam(affectedPlayer);
    });

    // Summon replay entities for all players in the replay
    multiPlayers.forEach((multiPlayer) => {
        summonReplayEntity(multiPlayer);
    });
}

function doStopCamera(player) {
    // Clear the camera for the player
    player.runCommand("camera @s clear");

    // Get and clear the commands stored in the first timeout map for the player
    const camTimeout1 = repCamTout1Map.get(player.id);
    camTimeout1.forEach((command) => {
        system.clearRun(command);
    });
    repCamTout1Map.delete(player.id);

    // Get and clear the commands stored in the second timeout map for the player
    const camTimeout2 = repCamTout2Map.get(player.id);
    camTimeout2.forEach((command) => {
        system.clearRun(command);
    });
    repCamTout2Map.delete(player.id);
}
function doStopReplay(player) {
    // Check if the replay is already stopped
    if (currentSwitch === false) {
        // Display action bar message if text prompts are enabled
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.replay.is.already.stopped",
                    },
                ],
            });
        }
        // Play sound cue if enabled
        if (soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    // Set the replay state to 'completed'
    replayStateMachine.setState("recCompleted");

    // If replay type is 'default', perform the following actions for each player
    if (settReplayType === 0) {
        multiPlayers.forEach((currentPlayer) => {
            // Disable all camera switches
            followCamSwitch = false;
            topDownCamSwitch = false;
            topDownCamSwitch2 = false;

            // Remove replay data and reset structures for the player
            const replayData = replayODataMap.get(currentPlayer.id);
            replayData.remove();
            clearStructure(currentPlayer);

            // Clear the player's camera and stop any active camera command
            currentPlayer.camera.clear();
            currentPlayer.runCommand("camera @s clear");

            // Call the function to stop the camera
            doStopCamera(currentPlayer);
        });
    }

    // Reset the tick counter and current switch state
    lilTick = 0;
    currentSwitch = false;

    // Display action bar message indicating the replay has stopped
    if (textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [
                {
                    translate: "dbg.rc1.mes.replay.stopped",
                },
            ],
        });
    }
}

function cancelRec(player) {
    // Create a form with options for the player
    const actionForm = new mcUI.ActionFormData().title("dbg.rc1.title.replay.menu").button("dbg.rc1.button.load.build.and.Reset").button("dbg.rc1.button.delete.progress").body("dbg.rc1.body.made.by.dbg");

    // Show the form to the player and handle their selection
    actionForm.show(player).then((formResult) => {
        // If the form is canceled, do nothing and return
        if (formResult.canceled) {
            return;
        }

        // Map the player's selection to the corresponding action
        const actions = {
            0: () => doSaveReset(player), // Option 0: Save and reset
            1: () => deletePro(player), // Option 1: Delete progress
        };

        // Execute the selected action if it exists
        const selectedAction = actions[formResult.selection];
        if (selectedAction) {
            selectedAction();
        }
    });
}

function removeEntities(player) {
    const dimension = player.dimension;

    // Remove replay entities
    const replayEntities = dimension.getEntities({ type: "dbg:replayentity" });
    replayEntities.forEach((entity) => {
        entity.remove();
    });

    // Remove camera positions
    const cameraPositions = dimension.getEntities({ type: "dbg:rccampos" });
    cameraPositions.forEach((camera) => {
        camera.remove();
    });
}

function deletePro(player) {
    // Check if a replay or preview is in progress
    if (currentSwitch === true) {
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.please.wait.for.replay.or.preview.to.be.completed",
                    },
                ],
            });
        }
        if (soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    // Reset camera setup and replay state
    resetCamSetup(player);
    replayStateMachine.setState("default");

    // Remove entities, structures, and reset the recording for all multiPlayers
    multiPlayers.forEach((multiPlayer) => {
        removeEntities(multiPlayer);
        clearStructure(multiPlayer);
        resetRec(multiPlayer);
    });
}

function doSaveReset(player) {
    // Check if a replay or preview is in progress
    if (currentSwitch === true) {
        if (textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.please.wait.for.replay.or.preview.to.be.completed",
                    },
                ],
            });
        }
        if (soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    // Reset camera setup and replay state
    resetCamSetup(player);
    replayStateMachine.setState("default");

    // Clear structures, remove entities, and load blocks for all multiPlayers
    multiPlayers.forEach((multiPlayer) => {
        clearStructure(multiPlayer);
        removeEntities(multiPlayer);
        loadBlocksUpToTick(dbgRecTime, multiPlayer);
    });

    // Reset recording for all multiPlayers
    multiPlayers.forEach((multiPlayer) => {
        resetRec(multiPlayer);
    });
}

function resetRec(player) {
    // Reset all the relevant replay states
    dbgRecController = undefined;
    currentSwitch = false;
    dbgRecTime = 0;
    lilTick = 0;
    replaySpeed = 1;

    // Reset player-specific replay data for each type of data map
    replayBDataMap.set(player.id, {
        dbgBlockData: {},
    });
    replayBDataBMap.set(player.id, {
        dbgBlockDataB: {},
    });
    replayBData1Map.set(player.id, {
        dbgBlockData1: {},
    });
    replayPosDataMap.set(player.id, {
        dbgRecPos: [],
    });
    replayRotDataMap.set(player.id, {
        dbgRecRot: [],
    });
    replayMDataMap.set(player.id, {
        isSneaking: [],
    });
    replayODataMap.set(player.id, {
        customEntity: undefined,
    });
    replaySDataMap.set(player.id, {
        weapon1: [],
        weapon2: [],
        armor1: [],
        armor2: [],
        armor3: [],
        armor4: [],
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
    // Clear structures and remove entities for all players
    multiPlayers.forEach((currentPlayer) => {
        clearStructure(currentPlayer);
        removeEntities(currentPlayer);
    });

    // Reset camera setup and related flags
    currentSwitch = false;
    frameLoaded = false;
    replayCamPos = [];
    replayCamRot = [];
    wantLoadFrameTick = 0;

    // Display success message on the player's screen
    player.onScreenDisplay.setActionBar({
        rawtext: [
            {
                translate: "dbg.rc1.mes.interaction.successfull",
            },
        ],
    });

    // Reset time-related variables
    frameLoaded = false;
    startingValueTick = 0;
    startingValueSecs = 0;
    startingValueMins = 0;
    startingValueHrs = 0;
}
// Experimental code not in use yet
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------
function whatToDo(_0xaf0529) {
    const _0x58a7fa = new mcUI.ActionFormData()
        .title("Â§9What To Do Here ??")
        .button("Got It!")
        .body("This is early version so all the replay feature in this are still work in progress, please use it carefully. Feel free to share your feedbacks.\n\n");
    return new Promise((_0x3c8e05, _0x570fb1) => {
        _0x58a7fa
            .show(_0xaf0529)
            .then((_0x2e7225) => {
                _0x3c8e05(_0x2e7225);
                ReplayCraft2A(_0xaf0529);
            })
            ["catch"]((_0x39824d) => {
                _0x570fb1(_0x39824d);
            });
    });
}
function saveReplayData(_0x257386) {
    const _0x19351b = replayBDataMap.get(_0x257386.id);
    const _0x4cd489 = replayBDataBMap.get(_0x257386.id);
    const _0x220214 = replayBData1Map.get(_0x257386.id);
    const _0x19c6e6 = replayPosDataMap.get(_0x257386.id);
    const _0x338ef9 = replayRotDataMap.get(_0x257386.id);
    const _0x290971 = replayMDataMap.get(_0x257386.id);
    const _0x3dcefb = replaySDataMap.get(_0x257386.id);
    if (_0x19351b) {
        world.setDynamicProperty("replayBData_" + _0x257386.id, JSON.stringify(_0x19351b));
    }
    if (_0x4cd489) {
        world.setDynamicProperty("replayBDataB_" + _0x257386.id, JSON.stringify(_0x4cd489));
    }
    if (_0x220214) {
        world.setDynamicProperty("replayBData1_" + _0x257386.id, JSON.stringify(_0x220214));
    }
    if (_0x19c6e6) {
        world.setDynamicProperty("replayPosData_" + _0x257386.id, JSON.stringify(_0x19c6e6));
    }
    if (_0x338ef9) {
        world.setDynamicProperty("replayRotData_" + _0x257386.id, JSON.stringify(_0x338ef9));
    }
    if (_0x290971) {
        world.setDynamicProperty("replayMData_" + _0x257386.id, JSON.stringify(_0x290971));
    }
    if (_0x3dcefb) {
        world.setDynamicProperty("replaySData_" + _0x257386.id, JSON.stringify(_0x3dcefb));
    }
    _0x257386.onScreenDisplay.setActionBar("Replay Data Has Been Arrested");
}
function retrieveReplayData(_0x294ead) {
    const _0x586323 = world.getDynamicProperty("replayBData_" + _0x294ead.id);
    const _0x3185a8 = world.getDynamicProperty("replayBDataB_" + _0x294ead.id);
    const _0x439d7e = world.getDynamicProperty("replayBData1_" + _0x294ead.id);
    const _0x1a2928 = world.getDynamicProperty("replayPosData_" + _0x294ead.id);
    const _0x269b3c = world.getDynamicProperty("replayRotData_" + _0x294ead.id);
    const _0x2ad14c = world.getDynamicProperty("replayMData_" + _0x294ead.id);
    const _0x2585fc = world.getDynamicProperty("replaySData_" + _0x294ead.id);
    const _0x1acc64 = _0x586323 ? JSON.parse(_0x586323) : null;
    const _0x5d7728 = _0x3185a8 ? JSON.parse(_0x3185a8) : null;
    const _0x5d23ba = _0x439d7e ? JSON.parse(_0x439d7e) : null;
    const _0x3382a1 = _0x1a2928 ? JSON.parse(_0x1a2928) : null;
    const _0x5639a5 = _0x269b3c ? JSON.parse(_0x269b3c) : null;
    const _0x6a368 = _0x2ad14c ? JSON.parse(_0x2ad14c) : null;
    const _0x1971c3 = _0x2585fc ? JSON.parse(_0x2585fc) : null;
    if (_0x1acc64) {
        replayBDataMap.set(_0x294ead.id, _0x1acc64);
    }
    if (_0x5d7728) {
        replayBDataBMap.set(_0x294ead.id, _0x5d7728);
    }
    if (_0x5d23ba) {
        replayBData1Map.set(_0x294ead.id, _0x5d23ba);
    }
    if (_0x3382a1) {
        replayPosDataMap.set(_0x294ead.id, _0x3382a1);
    }
    if (_0x5639a5) {
        replayRotDataMap.set(_0x294ead.id, _0x5639a5);
    }
    if (_0x6a368) {
        replayMDataMap.set(_0x294ead.id, _0x6a368);
    }
    if (_0x1971c3) {
        replaySDataMap.set(_0x294ead.id, _0x1971c3);
    }
    _0x294ead.onScreenDisplay.setActionBar("Replay Data Has Been Released");
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
    world.setDynamicProperty("multiToggle", multiToggle);
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
    multiToggle = world.getDynamicProperty("multiToggle") ?? false;
    replaySpeed = world.getDynamicProperty("replaySpeed") ?? 1;
    followCamSwitch = world.getDynamicProperty("followCamSwitch") ?? false;
    topDownCamSwitch = world.getDynamicProperty("topDownCamSwitch") ?? false;
    topDownCamSwitch2 = world.getDynamicProperty("topDownCamSwitch2") ?? false;
    topDownCamHight = world.getDynamicProperty("topDownCamHight") ?? 8;
    focusPlayerSelection = world.getDynamicProperty("focusPlayerSelection") ?? 0;
    affectCameraSelection = world.getDynamicProperty("affectCameraSelection") ?? 0;
}
function saveReplayAnchors() {
    world.setDynamicProperty("replayMachineState", replayStateMachine.state);
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
    const _0x4dbd4f = multiPlayers.map((_0x48d15c) => _0x48d15c.id);
    world.setDynamicProperty("multiPlayers", JSON.stringify(_0x4dbd4f));
}
function retrieveReplayAnchors() {
    replayStateMachine.setState(world.getDynamicProperty("replayMachineState"));
    const replayControllerId = world.getDynamicProperty("dbgRecController");
    const camFocusPlayerId = world.getDynamicProperty("dbgCamFocusPlayer");

    for (const player of world.getPlayers()) {
        if (replayControllerId && player.id === replayControllerId) {
            replayController = player;
        }
        if (camFocusPlayerId && player.id === camFocusPlayerId) {
            camFocusPlayer = player;
        }
    }

    replayCamPos = JSON.parse(world.getDynamicProperty("replayCamPos") ?? "[]");
    replayCamRot = JSON.parse(world.getDynamicProperty("replayCamRot") ?? "[]");
    currentSwitch = world.getDynamicProperty("currentSwitch") ?? false;
    replayDuration = world.getDynamicProperty("dbgRecTime") ?? 0;
    elapsedTime = world.getDynamicProperty("lilTick") ?? 0;

    const multiPlayerIds = JSON.parse(world.getDynamicProperty("multiPlayers") ?? "[]");
    multiPlayers = multiPlayerIds.map((playerId) => world.getPlayers().find((player) => player.id === playerId)).filter((player) => player);
}

function saveAffectedPlayer() {
    const _0x1c99cd = dbgCamAffectPlayer.map((_0x5d44d7) => _0x5d44d7.id);
    world.setDynamicProperty("dbgCamAffectPlayer", JSON.stringify(_0x1c99cd));
}
function retrieveAffectedPlayer() {
    const _0x33409b = JSON.parse(world.getDynamicProperty("dbgCamAffectPlayer") ?? "[]");
    dbgCamAffectPlayer = _0x33409b.map((_0x278c64) => world.getPlayers().find((_0x554e65) => _0x554e65.id === _0x278c64)).filter((_0x42f1af) => _0x42f1af);
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

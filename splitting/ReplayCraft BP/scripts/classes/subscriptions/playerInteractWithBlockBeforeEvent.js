import { world } from "@minecraft/server";
import { SharedVariables } from "../../main";

function setController(eventData) {
    console.log("[ReplayCraft] Interact event triggered!");

    const player = eventData.player;

    if (!eventData.itemStack) {
        console.log("[ReplayCraft] No item in hand.");
        return;
    }

    console.log(`[ReplayCraft] Player: ${player.name} | Item: ${eventData.itemStack.typeId} | NameTag: ${eventData.itemStack.nameTag}`);

    if (eventData.itemStack.typeId === "minecraft:stick" &&
        /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)) {
        
        console.log("[ReplayCraft] Stick with correct name detected!");

        if (player === SharedVariables.dbgRecController || !SharedVariables.dbgRecController) {
            console.log("[ReplayCraft] Setting player as replay controller.");

            if (!SharedVariables.multiPlayers) {
                console.log("[ReplayCraft] Initializing multiPlayers array.");
                SharedVariables.multiPlayers = [];
            }

            if (!SharedVariables.multiPlayers.includes(player)) {
                SharedVariables.multiPlayers.push(player);
                console.log(`[ReplayCraft] Added ${player.name} to multiPlayers.`);
            } else {
                console.log(`[ReplayCraft] ${player.name} is already in multiPlayers.`);
            }
        } else {
            console.log(`[ReplayCraft] Replay already controlled by: ${SharedVariables.dbgRecController.name}`);
            player.onScreenDisplay.setActionBar(`${SharedVariables.dbgRecController.name} is controlling the replay.`);
        }
    }
}

function b(event) {
    console.log("[ReplayCraft] Block interaction event triggered!");

    if (!SharedVariables.replayStateMachine) {
        console.error("[ReplayCraft] replayStateMachine is undefined!");
        return;
    }

    console.log(`[ReplayCraft] Current State: ${SharedVariables.replayStateMachine.state}`);

    if (SharedVariables.replayStateMachine.state !== "recPending") {
        console.log("[ReplayCraft] State is not 'recPending'. Ignoring event.");
        return;
    }

    const { player, block } = event;

    if (!SharedVariables.multiPlayers.includes(player)) {
        console.log(`[ReplayCraft] Player ${player.name} is not in multiPlayers. Ignoring.`);
        return;
    }

    console.log(`[ReplayCraft] Player ${player.name} interacted with block: ${block.typeId} at (${block.location.x}, ${block.location.y}, ${block.location.z})`);

    if (!block) {
        console.error("[ReplayCraft] Block data is undefined!");
        return;
    }

    if (SharedVariables.twoPartBlocks.includes(block.type.id)) {
        console.log("[ReplayCraft] Detected two-part block. Saving...");
        saveDoorParts1(block, player);
    } else {
        console.log("[ReplayCraft] Storing block data...");

        if (!SharedVariables.replayBData1Map.has(player.id)) {
            console.log(`[ReplayCraft] No existing data map for player ${player.name}, creating one.`);
            SharedVariables.replayBData1Map.set(player.id, { dbgBlockData1: {} });
        }

        const playerData = SharedVariables.replayBData1Map.get(player.id);
        playerData.dbgBlockData1[SharedVariables.dbgRecTime] = {
            location: block.location,
            typeId: block.typeId,
            states: block.permutation.getAllStates()
        };

        console.log(`[ReplayCraft] Block data recorded: ${JSON.stringify(playerData.dbgBlockData1[SharedVariables.dbgRecTime])}`);
    }
}

const replaycraftInteractWithBlockBeforeEvent = () => {
    console.log("[ReplayCraft] Registering event listeners...");
    world.beforeEvents.playerInteractWithBlock.subscribe(setController);
    world.beforeEvents.playerInteractWithBlock.subscribe(b);
};

console.log("[ReplayCraft] Initializing replaycraftInteractWithBlockBeforeEvent...");
replaycraftInteractWithBlockBeforeEvent();

export { replaycraftInteractWithBlockBeforeEvent };

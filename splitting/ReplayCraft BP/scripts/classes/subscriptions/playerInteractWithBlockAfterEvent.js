import { world } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { saveDoorPartsB } from "../../functions/saveDoorPartsB";

// Function to handle item interaction (sets replay controller)
function setController(eventData) {
    console.log("[ReplayCraft] Item used! Checking conditions...");
    const player = eventData.player;

    if (!eventData.itemStack) {
        console.log("[ReplayCraft] No item detected.");
        return;
    }

    console.log(`[ReplayCraft] Item detected: ${eventData.itemStack.typeId}`);

    if (eventData.itemStack?.typeId === 'minecraft:stick' && 
        /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)) {
        
        console.log("[ReplayCraft] Item name matched!");

        if (player === SharedVariables.dbgRecController || !SharedVariables.dbgRecController) {
            console.log(`[ReplayCraft] Setting controller: ${player.name}`);

            // Initialize replay data for each player
            SharedVariables.multiPlayers.forEach((player) => {
                if (!SharedVariables.replayBDataMap.has(player.id)) {
                    console.log(`[ReplayCraft] Initializing replay data for ${player.name} (${player.id})`);
                    SharedVariables.replayBDataMap.set(player.id, { dbgBlockData: {} });
                    SharedVariables.replayBDataBMap.set(player.id, { dbgBlockDataB: {} });
                    SharedVariables.replayBData1Map.set(player.id, { dbgBlockData1: {} });
                    SharedVariables.replayPosDataMap.set(player.id, { dbgRecPos: [] });
                    SharedVariables.replayRotDataMap.set(player.id, { dbgRecRot: [] });
                    SharedVariables.replayMDataMap.set(player.id, { isSneaking: [] });
                    SharedVariables.replayODataMap.set(player.id, { customEntity: undefined });
                    SharedVariables.replaySDataMap.set(player.id, {
                        weapon1: [],
                        weapon2: [],
                        armor1: [],
                        armor2: [],
                        armor3: [],
                        armor4: []
                    });
                }
            });

            console.log("[ReplayCraft] Calling replayStateMachine.handleEvent()");
            if (!SharedVariables.replayStateMachine) {
                console.error("[ReplayCraft] replayStateMachine is undefined!");
            } else {
                console.log(`[ReplayCraft] Current state: ${SharedVariables.replayStateMachine.state}`);
                SharedVariables.replayStateMachine.handleEvent(player);
            }

        } else {
            console.log("[ReplayCraft] Replay already controlled by:", SharedVariables.dbgRecController.name);
            player.onScreenDisplay.setActionBar(`${SharedVariables.dbgRecController.name} is controlling the replay.`);
        }
    }
}

// Function to record block interactions
function recordBlockInteraction(event) {
    if (SharedVariables.replayStateMachine.state === "recPending") {
        const { player, block } = event;
        if (!SharedVariables.multiPlayers.includes(player)) return;

        console.log(`[ReplayCraft] Recording block interaction for ${player.name}`);

        if (SharedVariables.twoPartBlocks.includes(block.type.id)) {
            console.log("[ReplayCraft] Detected two-part block. Saving...");
            saveDoorPartsB(block, player);
        } else {
            console.log("[ReplayCraft] Storing block data...");
            const playerData = SharedVariables.replayBDataBMap.get(player.id);
            playerData.dbgBlockDataB[SharedVariables.dbgRecTime] = {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates()
            };
            console.log(`[ReplayCraft] Block state recorded: ${JSON.stringify(playerData.dbgBlockDataB[SharedVariables.dbgRecTime])}`);
        }
    } else {
        console.log("[ReplayCraft] State is not recPending, ignoring block interaction.");
    }
}

// Function to subscribe to events
const replaycraftInteractWithBlockAfterEvent = () => {
    console.log("[ReplayCraft] Registering event subscriptions...");
    world.afterEvents.playerInteractWithBlock.subscribe(setController);
    world.afterEvents.playerInteractWithBlock.subscribe(recordBlockInteraction);
};

console.log("[ReplayCraft] Initializing...");
replaycraftInteractWithBlockAfterEvent();

export { replaycraftInteractWithBlockAfterEvent };

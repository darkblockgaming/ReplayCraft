import { PlayerSpawnAfterEvent, system, world } from "@minecraft/server";
/**
 * Function to execute when a player spawns.
 * Initializes event handlers for player spawn events.
 */
export function onPlayerSpawn() {
    initializeEventHandlers();
}

/**
 * Function to initialize event handlers for player spawn events.
 * Subscribes to the player spawn event to handle additional logic.
 */
function initializeEventHandlers() {
    world.afterEvents.playerSpawn.subscribe(handlePlayerSpawn);
}

/**
 * Handles player spawn events.
 * This function is triggered when a player spawns in the world.
 * @param {PlayerSpawnAfterEvent} event - The event object containing information about player spawn.
 */
function handlePlayerSpawn(event: PlayerSpawnAfterEvent) {

    if (event.initialSpawn) {
    
        triggerMessage(event);
        
    }
/**
 Trigger a message to the player after they spawn.
 * @param {PlayerSpawnAfterEvent} event - the event object containing information about player spawn.
 */
 function triggerMessage(event: PlayerSpawnAfterEvent) {
    const player = event.player;

    // Delay by 7 seconds (140 game ticks)
    system.runTimeout(() => {
        player.sendMessage({
            rawtext: [{
                translate: "replaycraft.welcome.message"
            }]
        });
    }, 140); // 20 ticks = 1 second
}

}

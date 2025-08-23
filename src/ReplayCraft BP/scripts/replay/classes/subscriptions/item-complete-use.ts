import { ItemCompleteUseAfterEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import config from "../../data/util/config";

function captureCompleteData(eventData: ItemCompleteUseAfterEvent) {
    const player = eventData.source;
    const session = replaySessions.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;

    const bowEvents = session.playerItemUseDataMap.get(player.id);
    if (!bowEvents?.length) return;
    const tick = session.recordingEndTick;
    const lastEvent = bowEvents[bowEvents.length - 1];

    // Special handling for crossbows
    if (lastEvent.typeId === "minecraft:crossbow") {
        console.log("Crossbow After Event");
        if (lastEvent.endTime === 0) {
            // First release = charged but not fired
            lastEvent.endTime = tick;
            lastEvent.chargeTime = lastEvent.endTime - lastEvent.startTime;
            lastEvent.isCharged = true;
            console.log(`[ReplayCraft DEBUG] Crossbow charged: ${JSON.stringify(lastEvent)}`);
            if (config.debugItemUseEvents === true) {
                console.log(`[ReplayCraft DEBUG] Crossbow charged: ${JSON.stringify(lastEvent)}`);
            }
        } else if (lastEvent.isCharged && !lastEvent.firedAt) {
            // Second release = fire the charged projectile
            lastEvent.firedAt = tick;
            lastEvent.isCharged = false; // consumed
            if (config.debugItemUseEvents === true) {
                console.log(`[ReplayCraft DEBUG] Crossbow fired: ${JSON.stringify(lastEvent)}`);
            }
        }
    }
}

const replayCraftItemCompleteUseAfterEvent = () => {
    world.afterEvents.itemCompleteUse.subscribe(captureCompleteData);
};
export { replayCraftItemCompleteUseAfterEvent };

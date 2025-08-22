import { ItemReleaseUseAfterEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import config from "../../data/util/config";

function captureReleaseData(eventData: ItemReleaseUseAfterEvent) {
    const player = eventData.source;
    const session = replaySessions.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;

    const bowEvents = session.playerItemUseDataMap.get(player.id);
    if (!bowEvents?.length) return;
    const tick = session.recordingEndTick;
    const lastEvent = bowEvents[bowEvents.length - 1];

    // Normal chargeable item (bow/trident/etc.)
    if (lastEvent.typeId !== "minecraft:crossbow") {
        if (lastEvent.endTime === 0) {
            lastEvent.endTime = tick;
            lastEvent.chargeTime = lastEvent.endTime - lastEvent.startTime;
            if (config.debugItemUseEvents === true) {
                console.log(`[ReplayCraft DEBUG] Bow/Trident released: ${JSON.stringify(lastEvent)}`);
            }
        }
        return;
    }

    // Special handling for crossbows
    if (lastEvent.typeId === "minecraft:crossbow") {
        if (lastEvent.endTime === 0) {
            // First release = charged but not fired
            lastEvent.endTime = tick;
            lastEvent.chargeTime = lastEvent.endTime - lastEvent.startTime;
            lastEvent.isCharged = true;
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

const replayCraftItemReleaseAfterEvent = () => {
    world.afterEvents.itemReleaseUse.subscribe(captureReleaseData);
};
export { replayCraftItemReleaseAfterEvent };

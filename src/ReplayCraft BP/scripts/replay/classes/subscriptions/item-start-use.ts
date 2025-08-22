import { ItemStartUseAfterEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { itemUseData, PlayerItemUseDataMap } from "../types/types";
import config from "../../data/util/config";
function addBowEvent(map: PlayerItemUseDataMap, playerID: string, event: itemUseData) {
    let events = map.get(playerID);
    if (!events) {
        events = [];
        map.set(playerID, events);
    }
    events.push(event);
}
function captureStartData(eventData: ItemStartUseAfterEvent) {
    const player = eventData.source;
    const session = replaySessions.playerSessions.get(player.id);
    if (!session || session.replayStateMachine.state !== "recPending") return;
    const tick = session.recordingEndTick;

    const itemStartData = {
        trackingTick: tick,
        typeId: eventData.itemStack.typeId,
        startTime: tick,
        chargeTime: 0,
        endTime: 0,
    };

    addBowEvent(session.playerItemUseDataMap, player.id, itemStartData);
    if (config.debugItemUseEvents === true) {
        console.log(`[ReplayCraft DEBUG] Bow started charging: ${JSON.stringify(itemStartData)}`);
    }
}

const replayCraftItemStartAfterEvent = () => {
    world.afterEvents.itemStartUse.subscribe(captureStartData);
};
export { replayCraftItemStartAfterEvent };

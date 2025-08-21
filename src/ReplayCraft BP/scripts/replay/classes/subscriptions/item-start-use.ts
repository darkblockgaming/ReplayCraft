import { ItemStartUseAfterEvent, system, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { itemUseData, PlayerItemUseDataMap } from "../types/types";
function addBowEvent(map: PlayerItemUseDataMap, playerID: string, event: itemUseData) {
    let events = map.get(playerID);
    if (!events) {
        events = [];
        map.set(playerID, events);
    }
    events.push(event);
}
function captureStartData(eventData: ItemStartUseAfterEvent) {
    if (eventData.itemStack?.typeId === "minecraft:bow") {
        const player = eventData.source;
        const session = replaySessions.playerSessions.get(player.id);
        if (!session || session.replayStateMachine.state !== "recPending") return;
        const tick = session.recordingEndTick;

        const bowStartData = {
            trackingTick: tick,
            bowStart: system.currentTick,
            bowChargeTime: 0,
            bowEnd: 0,
        };

        addBowEvent(session.playerItemUseDataMap, player.id, bowStartData);

        console.log(`[ReplayCraft DEBUG] Bow started charging: ${JSON.stringify(bowStartData)}`);
    }
}

const replayCraftItemStartAfterEvent = () => {
    world.afterEvents.itemStartUse.subscribe(captureStartData);
};
export { replayCraftItemStartAfterEvent };

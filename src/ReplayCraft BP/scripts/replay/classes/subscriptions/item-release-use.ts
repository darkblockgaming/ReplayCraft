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
    if (lastEvent.endTime === 0) {
        lastEvent.endTime = tick;
        lastEvent.chargeTime = lastEvent.endTime - lastEvent.startTime;
        if (config.debugItemUseEvents === true) {
            console.log(`[ReplayCraft DEBUG] Bow released: ${JSON.stringify(lastEvent)}`);
        }
    }
}

const replayCraftItemReleaseAfterEvent = () => {
    world.afterEvents.itemReleaseUse.subscribe(captureReleaseData);
};
export { replayCraftItemReleaseAfterEvent };

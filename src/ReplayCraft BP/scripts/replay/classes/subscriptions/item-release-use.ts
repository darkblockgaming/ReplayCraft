import { ItemReleaseUseAfterEvent, system, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";

function captureReleaseData(eventData: ItemReleaseUseAfterEvent) {
    if (eventData.itemStack?.typeId === "minecraft:bow") {
        const player = eventData.source;
        const session = replaySessions.playerSessions.get(player.id);
        if (!session || session.replayStateMachine.state !== "recPending") return;

        const bowEvents = session.playerItemUseDataMap.get(player.id);
        if (!bowEvents?.length) return;

        const lastEvent = bowEvents[bowEvents.length - 1];
        if (lastEvent.bowEnd === 0) {
            lastEvent.bowEnd = system.currentTick;
            lastEvent.bowChargeTime = lastEvent.bowEnd - lastEvent.bowStart;

            console.log(`[ReplayCraft DEBUG] Bow released: ${JSON.stringify(lastEvent)}`);
        }
    }
}

const replayCraftItemReleaseAfterEvent = () => {
    world.afterEvents.itemReleaseUse.subscribe(captureReleaseData);
};
export { replayCraftItemReleaseAfterEvent };

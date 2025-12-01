import { ItemStopUseAfterEvent, world } from "@minecraft/server";
import { debugLog } from "../../data/util/debug";
//import { replaySessions } from "../../data/replay-player-session";
//import config from "../../data/util/config";

function captureStopData(eventData: ItemStopUseAfterEvent) {
    debugLog(`itemStopUseAfterEvent: ${eventData.itemStack.typeId}`);
}

const replayCraftItemStopUseAfterEvent = () => {
    world.afterEvents.itemStopUse.subscribe(captureStopData);
};
export { replayCraftItemStopUseAfterEvent };

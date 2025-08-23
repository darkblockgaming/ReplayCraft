import { ItemStopUseAfterEvent, world } from "@minecraft/server";
//import { replaySessions } from "../../data/replay-player-session";
//import config from "../../data/util/config";

function captureStopData(eventData: ItemStopUseAfterEvent) {
    console.log(`itemStopUseAfterEvent: ${eventData.itemStack.typeId}`);
}

const replayCraftItemStopUseAfterEvent = () => {
    world.afterEvents.itemStopUse.subscribe(captureStopData);
};
export { replayCraftItemStopUseAfterEvent };

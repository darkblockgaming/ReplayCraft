import { ItemUseAfterEvent, world } from "@minecraft/server";
import { newSession } from "../../ui/confirm-new-session";

function setController(eventData: ItemUseAfterEvent) {
    const player = eventData.source;
    const item = eventData.itemStack;
    const nameTag = item?.nameTag ?? "";

    // Only run if it's the correct stick
    if (item?.typeId === "minecraft:stick" && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(nameTag)) {
        newSession(player);
    }
}

const replaycraftItemUseAfterEvent = () => {
    world.afterEvents.itemUse.subscribe(setController);
};

export { replaycraftItemUseAfterEvent };

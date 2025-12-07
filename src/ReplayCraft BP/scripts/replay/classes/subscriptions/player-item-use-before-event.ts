import { ItemUseBeforeEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { debugLog } from "../../data/util/debug";

function setController(eventData: ItemUseBeforeEvent) {
    const player = eventData.source;
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        debugLog(`[Replay Init] No session found for ${player.name}`);
        return;
    }
    if (eventData.itemStack?.typeId === "minecraft:stick" && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)) {
        if (player === session.replayController || !session.replayController) {
            if (session.multiPlayerReplayEnabled === false) {
                session.trackedPlayers = [];
                session.trackedPlayers.push(player);
            }
        }
    }
}

const replaycraftItemUseBeforeEvent = () => {
    world.beforeEvents.itemUse.subscribe(setController);
};
export { replaycraftItemUseBeforeEvent };

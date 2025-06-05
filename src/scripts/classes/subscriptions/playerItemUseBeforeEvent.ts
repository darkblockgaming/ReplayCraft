import { ItemUseBeforeEvent, world } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";

function setController(eventData: ItemUseBeforeEvent) {
    const player = eventData.source;
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        console.log(`[Replay Init] No session found for ${player.name}`);
        return;
    }
    if (eventData.itemStack?.typeId === "minecraft:stick" && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)) {
        if (player === session.dbgRecController || !session.dbgRecController) {
            if (session.multiToggle === false) {
                session.multiPlayers = [];
                session.multiPlayers.push(player);
            }
        }
    }
}
const replaycraftItemUseBeforeEvent = () => {
    world.beforeEvents.itemUse.subscribe(setController);
};
export { replaycraftItemUseBeforeEvent };

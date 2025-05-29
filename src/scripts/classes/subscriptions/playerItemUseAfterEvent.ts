import { ItemUseAfterEvent, world } from "@minecraft/server";
import { createPlayerSession } from "../../data/create-session";
import { initializePlayerMaps } from "../../data/initialize-player-maps";
import { SharedVariables } from "../../data/replay-player-session";
import { replayCraftActiveSessionsDB } from "./world-initialize";

function setController(eventData: ItemUseAfterEvent) {
    const player = eventData.source;

    if (eventData.itemStack?.typeId === "minecraft:stick" && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)) {
        if (!SharedVariables.playerSessions.has(player.id)) {
            const session = createPlayerSession(player.id);
            initializePlayerMaps(session, player.id);
            session.playerName = player.name;
            replayCraftActiveSessionsDB.set(player.id, {
                playerId: player.id,
                playerName: player.name,
            });
            console.log(`[Replay Init] Session created for ${player.name}`);
        } else {
            console.log(`[Replay Init] Session already exists for ${player.name}`);
        }

        const session = SharedVariables.playerSessions.get(player.id)!;
        session.replayStateMachine.handleEvent(player);
    }
}

const replaycraftItemUseAfterEvent = () => {
    world.afterEvents.itemUse.subscribe(setController);
};

export { replaycraftItemUseAfterEvent };

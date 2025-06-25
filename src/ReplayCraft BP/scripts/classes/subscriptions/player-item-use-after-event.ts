import { ItemUseAfterEvent, world } from "@minecraft/server";
import { createPlayerSession } from "../../data/create-session";
import { initializePlayerMaps } from "../../data/initialize-player-maps";
import { replaySessions } from "../../data/replay-player-session";
import { replayCraftActiveSessionsDB } from "./world-initialize";

function setController(eventData: ItemUseAfterEvent) {
    const player = eventData.source;
    const item = eventData.itemStack;
    const nameTag = item?.nameTag ?? "";

    // Only run if it's the correct stick
    if (item?.typeId === "minecraft:stick" && /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(nameTag)) {
        // Create session if missing otherwise things will go bad.
        let session = replaySessions.playerSessions.get(player.id);
        if (!session) {
            session = createPlayerSession(player.id);
            initializePlayerMaps(session, player.id);
            session.playerName = player.name;
            replaySessions.playerSessions.set(player.id, session);
            replayCraftActiveSessionsDB.set(player.id, {
                playerId: player.id,
                playerName: player.name,
            });
            console.log(`[Replay Init] Session created for ${player.name}`);
        } else {
            console.log(`[Replay Init] Session already exists for ${player.name}`);
        }
        session.replayStateMachine.handleEvent(player);

        // Set controller logic (this used to be in beforeEvents)
        if (!session.replayController || session.replayController === player) {
            if (!session.multiPlayerReplayEnabled) {
                session.trackedPlayers = [player];
            }
            session.replayController = player;
            console.log(`[Replay Init] Controller set to ${player.name}`);
        }
    }
}

const replaycraftItemUseAfterEvent = () => {
    world.afterEvents.itemUse.subscribe(setController);
};

export { replaycraftItemUseAfterEvent };

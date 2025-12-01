import { Player } from "@minecraft/server";
import { MessageFormResponse, MessageFormData } from "@minecraft/server-ui";
import { debugLog } from "../data/util/debug";
import { replaySessions } from "../data/replay-player-session";
import { createPlayerSession } from "../data/create-session";
import { initializePlayerMaps } from "../data/initialize-player-maps";
import { replayCraftActiveSessionsDB } from "../classes/subscriptions/world-initialize";
import config from "../data/util/config";

export function newSession(player: Player) {
    let session = replaySessions.playerSessions.get(player.id);

    // If session already exists, skip the UI
    if (session) {
        if (config.debugPlayerItemUseAfterEvent === true) {
            debugLog(`[Replay Init] Existing session detected for ${player.name}, skipping confirmation.`);
        }
        session.replayStateMachine.handleEvent(player);

        // Set controller if not set
        if (!session.replayController || session.replayController === player) {
            if (!session.multiPlayerReplayEnabled && session.trackedPlayers.length === 0) {
                session.trackedPlayers = [player];
            }
            session.replayController = player;
            if (config.debugPlayerItemUseAfterEvent === true) {
                debugLog(`[Replay Init] Controller set to ${player.name}`);
            }
        }
        return;
    }

    const messageForm = new MessageFormData().title("replaycraft.new.session.title").body("replaycraft.new.session.body").button1("replaycraft.ui.yes.button").button2("replaycraft.ui.no.button");

    messageForm
        .show(player)
        .then((formData: MessageFormResponse) => {
            if (formData.canceled || formData.selection === undefined) {
                return;
            }

            if (formData.selection === 0) {
                //Yes button
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
                    if (config.debugPlayerItemUseAfterEvent === true) {
                        debugLog(`[Replay Init] Session created for ${player.name}`);
                    }
                } else {
                    if (config.debugPlayerItemUseAfterEvent === true) {
                        debugLog(`[Replay Init] Session already exists for ${player.name}`);
                    }
                }
                session.replayStateMachine.handleEvent(player);

                // Set controller logic (this used to be in beforeEvents)
                if (!session.replayController || session.replayController === player) {
                    if (!session.multiPlayerReplayEnabled && session.trackedPlayers.length === 0) {
                        session.trackedPlayers = [player];
                    }
                    session.replayController = player;
                    if (config.debugPlayerItemUseAfterEvent === true) {
                        debugLog(`[Replay Init] Controller set to ${player.name}`);
                    }
                }
                debugLog("Player clicked Button 1");
            } else if (formData.selection === 1) {
                //No button
                player.sendMessage("Session cancelled.");
                return;
            }
        })
        .catch((error: Error) => {
            debugLog("Failed to show form: " + error);
            return -1;
        });
}

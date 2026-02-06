import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { clearStructure } from "../clear-structure";
import { saveToExternalServer } from "./save-to-database";
import { debugError, debugLog } from "../../data/util/debug";
import config from "../../data/util/config";

export async function doSave(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    session.replayStateMachine.setState("recSaved");
    if (session.textPrompt) {
        player.sendMessage({
            rawtext: [
                {
                    translate: "rc1.mes.rec.saved.successfully",
                },
            ],
        });
    }
    session.trackedPlayers.forEach((player) => {
        clearStructure(player, session);
    });

    //saveToDB(player, session);
    try {
        await saveToExternalServer(session, player.id, config.backendURL);
        debugLog("Replay successfully sent to backend");
    } catch (err) {
        debugError("Failed to export replay:", err);
    }
}

import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { clearStructure } from "../clear-structure";
import { saveToDB } from "./save-to-database";

export function doSave(player: Player) {
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
                    translate: "dbg.rc1.mes.rec.saved.successfully",
                },
            ],
        });
    }
    session.trackedPlayers.forEach((player) => {
        clearStructure(player, session);
    });

    saveToDB(player, session);
}

import { Player } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
import { clearStructure } from "../clearStructure";
import { saveToDB } from "./save-to-database";

export function doSave(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
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
    session.multiPlayers.forEach((player) => {
        clearStructure(player);
    });

    saveToDB(player, session);
}

import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { clearStructure } from "../clearStructure";
import { removeEntities } from "../removeEntities";

export function doProceedFurther(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage("§c[ReplayCraft] Error: No replay session found for you.");
        return;
    }
    if (session.replayCamPos.length <= 1) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.at.least.two.camera.points.are.recommended",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    session.replayStateMachine.setState("recCompleted");
    session.multiPlayers.forEach((player) => {
        clearStructure(player);
    });
    removeEntities(player, false);
}

import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { clearStructure } from "../clear-structure";
import { removeEntities } from "../remove-entities";

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
                        translate: "rc1.mes.at.least.two.camera.points.are.recommended",
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
    session.trackedPlayers.forEach((player) => {
        clearStructure(player, session);
    });
    removeEntities(player, false);
}

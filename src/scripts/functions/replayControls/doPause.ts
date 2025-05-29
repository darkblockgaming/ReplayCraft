import { Player } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
export function doPause(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);

    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    session.replayStateMachine.setState("recPaused");
    if (session.textPrompt) {
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc1.mes.rec.paused.successfully",
                },
            ],
        });
    }
}

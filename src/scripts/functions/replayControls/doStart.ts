import { Player } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
import { removeEntities } from "../removeEntities";
import { resetRec } from "./resetRec";

export function doStart(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    session.multiPlayers.forEach((player) => {
        removeEntities(player, false);
        resetRec(player);
    });
    session.replayStateMachine.setState("recPending");
    session.dbgRecController = player;
    if (session.multiToggle === false) {
        session.dbgCamFocusPlayer = session.dbgRecController;
        session.dbgCamAffectPlayer[0] = session.dbgRecController;
    }
    if (session.multiToggle === true) {
        session.dbgCamAffectPlayer = session.multiPlayers;
    }
    if (session.textPrompt) {
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc1.mes.rec.has.started",
                },
            ],
        });
    }
}

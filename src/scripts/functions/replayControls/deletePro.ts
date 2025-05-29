import { Player } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
import { resetCamSetup } from "../camera/resetCamSetup";
import { clearStructure } from "../clearStructure";
import { removeEntities } from "../removeEntities";
import { resetRec } from "./resetRec";

export function deletePro(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);

    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    if (session.currentSwitch === true) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.please.wait.for.replay.or.preview.to.be.completed",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    resetCamSetup(player);
    session.replayStateMachine.setState("default");
    session.multiPlayers.forEach((player) => {
        removeEntities(player, false);
        clearStructure(player);
        resetRec(player);
    });
}

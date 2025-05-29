import { Player } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
import { clearStructure } from "../clearStructure";

export function doStopPreview(player: Player) {
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
                        translate: "dbg.rc1.mes.replay.preview.has.stopped.successfully",
                    },
                ],
            });
        }
        session.replayStateMachine.setState("recSaved");

        session.multiPlayers.forEach((player) => {
            const customEntity = session.replayODataMap.get(player.id);
            customEntity.remove();
            clearStructure(player);
        });

        session.lilTick = 0;
        session.currentSwitch = false;
        return;
    } else {
        if (session.textPrompt) {
            player.onScreenDisplay.setActionBar({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.replay.preview.is.already.off",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
    }
}

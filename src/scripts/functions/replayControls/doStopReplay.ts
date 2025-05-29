import { Player } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
import { doStopCamera } from "../camera/doStopCamera";
import { clearStructure } from "../clearStructure";

export function doStopReplay(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    if (session.currentSwitch === false) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.replay.is.already.stopped",
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
    if (session.settReplayType === 0) {
        session.multiPlayers.forEach((player) => {
            session.followCamSwitch = false;
            session.topDownCamSwitch = false;
            session.topDownCamSwitch2 = false;

            const customEntity = session.replayODataMap.get(player.id);
            customEntity.remove();
            clearStructure(player);

            player.camera.clear();
            //player.runCommand(`camera @s clear`);
            doStopCamera(player);
        });
    }
    session.lilTick = 0;
    session.currentSwitch = false;

    if (session.textPrompt) {
        player.onScreenDisplay.setActionBar({
            rawtext: [
                {
                    translate: "dbg.rc1.mes.replay.stopped",
                },
            ],
        });
    }
}

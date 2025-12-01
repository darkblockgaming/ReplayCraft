import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { removeEntities } from "../remove-entities";
import { resetRec } from "./reset-replay";
import { debugLog } from "../../data/util/debug";

export function doStart(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    session.trackedPlayers.forEach((player) => {
        removeEntities(player, false);
        resetRec(player);
    });
    session.replayStateMachine.setState("recPending");
    session.replayController = player;
    debugLog(`dbgRecController: `, `${session.replayController.id}`);
    if (session.multiPlayerReplayEnabled === false) {
        session.cameraFocusPlayer = session.replayController;
        session.cameraAffectedPlayers[0] = session.replayController;
    }
    if (session.multiPlayerReplayEnabled === true) {
        session.cameraAffectedPlayers = session.trackedPlayers;
    }
    session.trackedPlayerJoinTicks.set(player.id, {
        joinTick: 0,
        name: player.name,
    });
    if (session.textPrompt) {
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc1.mes.rec.has.started",
                },
            ],
        });
    }
    debugLog(`ReplayCraft: log session `);
}

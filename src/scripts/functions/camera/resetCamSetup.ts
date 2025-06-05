import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { clearStructure } from "../clearStructure";
import { removeEntities } from "../removeEntities";

export function resetCamSetup(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage("§c[ReplayCraft] Error: No replay session found for you.");
        return;
    }

    session.trackedPlayers.forEach((player) => {
        clearStructure(player);
        removeEntities(player, false);
    });
    session.isReplayActive = false;
    session.frameLoaded = false;
    session.replayCamPos = [];
    session.replayCamRot = [];
    session.targetFrameTick = 0;
    player.sendMessage({
        rawtext: [
            {
                translate: "dbg.rc1.mes.interaction.successfull",
            },
        ],
    });
    session.frameLoaded = false;
    session.startingValueTick = 0;
    session.startingValueSecs = 0;
    session.startingValueMins = 0;
    session.startingValueHrs = 0;
}

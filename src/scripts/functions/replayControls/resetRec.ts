//@ts-check
import { Player } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";

export function resetRec(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    session.dbgRecController = undefined;
    session.currentSwitch = false;
    session.dbgRecTime = 0;
    session.lilTick = 0;
    session.replaySpeed = 1;
    session.replayBDataMap.set(player.id, {
        dbgBlockData: {},
    });
    session.replayBDataBMap.set(player.id, {
        dbgBlockDataB: {},
    });
    session.replayBData1Map.set(player.id, {
        dbgBlockData1: {},
    });
    session.replayPosDataMap.set(player.id, {
        dbgRecPos: [],
    });
    session.replayRotDataMap.set(player.id, {
        dbgRecRot: [],
    });
    session.replayMDataMap.set(player.id, {
        isSneaking: [],
        isSwimming: [],
        isClimbing: [],
        isFalling: [],
        isFlying: [],
        isGliding: [],
        isRiding: [],
        isSprinting: [],
        isSleeping: [],
    });
    session.replayODataMap.set(player.id, {
        customEntity: undefined,
    });
    session.replaySDataMap.set(player.id, {
        weapon1: [],
        weapon2: [],
        armor1: [],
        armor2: [],
        armor3: [],
        armor4: [],
    });
}

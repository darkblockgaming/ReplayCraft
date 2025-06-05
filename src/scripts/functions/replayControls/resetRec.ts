//@ts-check
import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";

export function resetRec(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    session.dbgRecController = undefined;
    session.currentSwitch = false;
    session.dbgRecTime = 0;
    session.lilTick = 0;
    session.replaySpeed = 1;
    session.replayBlockStateMap.set(player.id, {
        blockStateChanges: {},
    });
    session.replayBDataBMap.set(player.id, {
        blockSateAfterInteractions: {},
    });
    session.replayBData1Map.set(player.id, {
        blockStateBeforeInteractions: {},
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

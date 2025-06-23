//@ts-check
import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";

export function resetRec(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    session.replayController = undefined;
    session.isReplayActive = false;
    session.recordingEndTick = 0;
    session.currentTick = 0;
    session.replaySpeed = 1;
    session.replayBlockStateMap.set(player.id, {
        blockStateChanges: {},
    });
    session.replayBlockInteractionAfterMap.set(player.id, {
        blockSateAfterInteractions: {},
    });
    session.replayBlockInteractionBeforeMap.set(player.id, {
        blockStateBeforeInteractions: {},
    });
    session.replayPositionDataMap.set(player.id, {
        recordedPositions: [],
    });
    session.replayRotationDataMap.set(player.id, {
        recordedRotations: [],
    });
    session.replayActionDataMap.set(player.id, {
        isSneaking: [],
        isSwimming: [],
        isClimbing: [],
        isFalling: [],
        isFlying: [],
        isGliding: [],
        isRiding: [],
        isSprinting: [],
        isSleeping: [],
        ridingTypeId: [],
    });
    session.replayEntityDataMap.set(player.id, {
        customEntity: undefined,
    });
    session.replayEquipmentDataMap.set(player.id, {
        weapon1: [],
        weapon2: [],
        armor1: [],
        armor2: [],
        armor3: [],
        armor4: [],
    });
}

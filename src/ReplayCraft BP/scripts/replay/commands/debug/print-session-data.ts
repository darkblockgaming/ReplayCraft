//@ts-check
import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { debugWarn } from "../../data/util/debug";

/**
 * Debug: Print all Map-based replay session data for a given player.
 * Only prints maps; skips Sets, arrays, or other types.
 * @param {Player} player
 */
export function debugPrintSessionCmd(_origin: CustomCommandOrigin) {
    system.run(() => {
        const player = _origin.initiator as Player;
        const session = replaySessions.playerSessions.get(player.id);
        if (!session) {
            debugWarn(`[ReplayCraft] No replay session found for ${player.name} (${player.id})`);
        }

        debugWarn(`\n===== Replay Debug Dump for ${player.name} (${player.id}) =====`);
        debugWarn(`Controller: ${session.replayController?.id ?? "none"}`);
        debugWarn(`isReplayActive: ${session.isReplayActive}`);
        debugWarn(`recordingEndTick: ${session.recordingEndTick}`);
        debugWarn(`currentTick: ${session.currentTick}`);
        debugWarn(`replaySpeed: ${session.replaySpeed}`);
        debugWarn(`allRecordedPlayerIds:`, Array.from(session.allRecordedPlayerIds));

        // Only include Map properties you want to inspect
        const mapProps: (keyof typeof session)[] = [
            "replayBlockStateMap",
            "replayBlockInteractionAfterMap",
            "replayBlockInteractionBeforeMap",
            "replayPositionDataMap",
            "replayRotationDataMap",
            "replayActionDataMap",
            "replayEntityDataMap",
            "replayAmbientEntityMap",
            "replayEquipmentDataMap",
            "trackedPlayerJoinTicks",
            "playerDamageEventsMap",
            "playerItemUseDataMap",
        ];

        for (const prop of mapProps) {
            const mapCandidate = session[prop];
            if (mapCandidate instanceof Map) {
                debugWarn(`\n--- ${prop} ---`);
                for (const [id, data] of mapCandidate.entries()) {
                    debugWarn(` ${id}:`, JSON.stringify(data, null, 2));
                }
            }
        }

        debugWarn("===== End of Replay Debug Dump =====\n");
    });
    return {
        status: CustomCommandStatus.Success,
        message: `Check the console for data.`,
    };
}

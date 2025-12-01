import { Player } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session";
import { blockPlaceSounds } from "../data/util/sounds-place-map";
import { BlockData } from "../classes/types/types";
import { blockInteractSounds } from "../data/util/sounds-interact-map";
import { blockBreakSounds } from "../data/util/sounds-break-map";
import { debugError, debugWarn } from "../data/util/debug";

/**
 * Plays the appropriate sound for a block interaction, placement, or destruction.
 *
 * This function checks for different types of block events and plays a corresponding sound:
 * - Interaction sounds (e.g. doors opening/closing) based on block states.
 * - Block breaking sounds if the `eventType` is `"break"`.
 * - Default block placement sound.
 *
 * @param {BlockData} blockData - The block event data, including ID, location, state, and type.
 * @param {Player} player - The player responsible for the interaction.
 * @param {boolean} [interact] - Whether this sound is from an interaction (like opening a door).
 */
export function playBlockSound(blockData: BlockData, player: Player, interact?: boolean): void {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        debugWarn(`[ReplayCraft DEBUG] No replay session found for player ${player.name}`);
        return;
    }

    if (!blockData) {
        debugError(`[ReplayCraft DEBUG] playBlockSound called with undefined blockData for ${player.name}`);
        return;
    }

    if (!blockData.typeId) {
        debugError(`[ReplayCraft DEBUG] blockData has no typeId for ${player.name}`, blockData);
        return;
    }

    try {
        if (interact) {
            const blockId = blockData.typeId.replace("minecraft:", "");
            const location = blockData.location;
            const states = blockData.states ?? {};
            const soundData = blockInteractSounds[blockId];

            if (!soundData) {
                debugWarn(`[ReplayCraft DEBUG] No interact sound mapping for blockId "${blockId}" (player: ${player.name})`);
            }

            // Play interact sound (e.g., door open/close)
            if (soundData && "open_bit" in states) {
                const open = states.open_bit === true;
                const sound = open ? soundData.sound : soundData.closeSound;
                const pitch = open ? soundData.pitch : soundData.closedPitch;
                session.replayController.playSound(sound, { location, pitch });
            }

            // Play break sound
            if (blockData.eventType === "break") {
                const breakSound = blockBreakSounds[blockId];
                if (!breakSound) {
                    debugWarn(`[ReplayCraft DEBUG] No break sound mapping for blockId "${blockId}" (player: ${player.name})`);
                } else {
                    session.replayController.playSound(breakSound.sound, {
                        location,
                        pitch: breakSound.pitch,
                    });
                }
            }
        }
    } catch (error) {
        debugError(`Error playing block break/interact sound for player ${player.name}:`, error, blockData);
    }

    // Play default placement sound
    try {
        const { location, typeId } = blockData;
        const blockId = typeId.replace("minecraft:", "");
        const soundData = blockPlaceSounds[blockId];

        if (!soundData) {
            debugWarn(`[ReplayCraft DEBUG] No placement sound mapping for blockId "${blockId}" (player: ${player.name})`);
            return;
        }

        session.replayController.playSound(soundData.sound, { location, pitch: soundData.pitch });
    } catch (error) {
        debugError(`Error playing block placement sound for player ${player.name}:`, error, blockData);
    }
}

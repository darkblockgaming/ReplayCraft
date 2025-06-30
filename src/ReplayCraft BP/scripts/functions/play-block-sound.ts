import { Player } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session";
import { blockPlaceSounds } from "../data/util/sounds-place-map";
import { BlockData } from "../classes/types/types";
import { blockInteractSounds } from "../data/util/sounds-interact-map";

export function playBlockSound(blockData: BlockData, player: Player, interact?: boolean): void {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) return;
    if (interact) {
        const blockId = blockData.typeId.replace("minecraft:", "");
        for (const [key, value] of Object.entries(blockData.states ?? {})) {
            console.log(`State: ${key} = ${value}`);
            switch (key) {
                case "open_bit":
                    if (value === true) {
                        const location = blockData.location;
                        const soundData = blockInteractSounds[blockId];
                        session.replayController.playSound(soundData.sound, { location, pitch: soundData.pitch });
                        //open bit is true, play door open sound
                    } else {
                        const location = blockData.location;
                        const soundData = blockInteractSounds[blockId];
                        session.replayController.playSound(soundData.closeSound, { location, pitch: soundData.pitch });
                        //open bit is false, play door close sound
                    }

                    break;
            }
        }
    }

    const { location, typeId } = blockData;
    const blockId = typeId.replace("minecraft:", ""); // normalize block ID

    const soundData = blockPlaceSounds[blockId];

    if (!soundData) {
        console.warn(`No place sound found for block: ${blockId}`);
        return;
    }

    session.replayController.playSound(soundData.sound, { location, pitch: soundData.pitch });
}

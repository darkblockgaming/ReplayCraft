import { Player, Vector3 } from "@minecraft/server";
import { replaySessions } from "../data/replay-player-session";
import { blockPlaceSounds } from "../data/util/sounds-place-map";

interface BlockData {
    location: Vector3;
    typeId: string;
    states: Record<string, any>;
}

export function playBlockSound(blockData: BlockData, player: Player): void {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) return;

    const { location, typeId } = blockData;
    const blockId = typeId.replace("minecraft:", ""); // normalize block ID

    const soundData = blockPlaceSounds[blockId];

    if (!soundData) {
        console.warn(`No place sound found for block: ${blockId}`);
        return;
    }

    session.replayController.playSound(soundData.sound, { location, pitch: soundData.pitch });
}

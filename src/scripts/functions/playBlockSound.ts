import { Player, Vector3 } from "@minecraft/server";
import { SharedVariables } from "../data/replay-player-session";

// Define the structure of the block data
interface BlockData {
    location: Vector3;
    typeId: string;
    states: Record<string, any>;
}

export function playBlockSound(blockData: BlockData, player: Player): void {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        console.error(`No session found for player ${player.name}`);
        return;
    }
    if (!session.toggleSound) return;

    const { location } = blockData;

    session.dbgRecController.playSound(session.soundIds[session.selectedSound], {
        location: location,
    });
}

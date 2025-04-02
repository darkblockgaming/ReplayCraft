import { Player } from "@minecraft/server";

export function isChunkLoaded(position: { x: number; y: number; z: number }, player: Player) {
    try {
        return !!player.dimension.getBlock(position);
    } catch {
        return false;
    }
}
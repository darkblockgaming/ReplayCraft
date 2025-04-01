
export function isChunkLoaded(position, player) {
    try {
        return !!player.dimension.getBlock(position);
    } catch {
        return false;
    }
}
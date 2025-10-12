import { Player } from "@minecraft/server";


// Small helper to avoid repeating message + sound
export async function notifyPlayer(player: Player, translationKey: string, sound?: string) {
    player.sendMessage({ translate: translationKey });
    if (sound) player.playSound(sound);
}

import { Player } from "@minecraft/server";


// Small helper to avoid repeating message + sound
export async function notifyPlayer(player: Player, translationKey: string, sound: string = "note.bass") {
    player.sendMessage({ translate: translationKey });
    player.playSound(sound);
}

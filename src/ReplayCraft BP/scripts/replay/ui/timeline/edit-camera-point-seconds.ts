import * as ui from "@minecraft/server-ui";
import { replaySessions } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";

export async function editCameraPointSeconds(player: Player, index: number) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    const oldSeconds = Math.round(session.replayCamPos[index].tick / 20); // Convert to seconds

    const form = new ui.ModalFormData().title("Edit Camera Point").textField("Enter new time in seconds:", "e.g. 240", {
        defaultValue: `${oldSeconds}`,
    });

    const response = await form.show(player);
    if (response.canceled) return;

    const newSeconds = parseInt(String(response.formValues[0]));
    if (isNaN(newSeconds)) {
        player.sendMessage("§cInvalid time value.");
        return;
    }

    const newTick = newSeconds * 20; // Convert seconds back to ticks
    const existing = session.replayCamPos.find((c, i) => i !== index && c.tick === newTick);
    if (existing) {
        player.sendMessage("§cA camera point already exists at that time.");
        return;
    }

    session.replayCamPos[index].tick = newTick;
    session.replayCamRot[index].tick = newTick;

    player.sendMessage(`§aCamera point updated to ${newSeconds} second(s).`);
}

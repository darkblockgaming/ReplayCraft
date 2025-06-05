import * as ui from "@minecraft/server-ui";
import { replaySessions } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";

export async function editCameraPointTick(player: Player, index: number) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    const oldTick = session.replayCamPos[index].tick;

    const form = new ui.ModalFormData().title("Edit Camera Point").textField("Enter new tick value:", "e.g. 240", oldTick.toString());

    const response = await form.show(player);
    if (response.canceled) return;

    const newTick = parseInt(String(response.formValues[0]));

    if (isNaN(newTick)) {
        player.sendMessage("§cInvalid tick value.");
        return;
    }

    const existing = session.replayCamPos.find((c, i) => i !== index && c.tick === newTick);
    if (existing) {
        player.sendMessage("§cA camera point already exists at that tick.");
        return;
    }

    session.replayCamPos[index].tick = newTick;
    session.replayCamRot[index].tick = newTick;

    player.sendMessage(`§aCamera point updated to tick ${newTick}.`);
}

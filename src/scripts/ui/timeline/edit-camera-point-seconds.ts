import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../main";
import { Player } from "@minecraft/server";

export async function editCameraPointSeconds(player: Player, index: number) {
    const oldSeconds = Math.round(SharedVariables.replayCamPos[index].tick / 20);  // Convert to seconds

    const form = new ui.ModalFormData()
        .title("Edit Camera Point")
        .textField("Enter new time in seconds:", "e.g. 240", oldSeconds.toString());

    const response = await form.show(player);
    if (response.canceled) return;

    const newSeconds = parseInt(String(response.formValues[0]));
    if (isNaN(newSeconds)) {
        player.sendMessage("§cInvalid time value.");
        return;
    }

    const newTick = newSeconds * 20;  // Convert seconds back to ticks
    const existing = SharedVariables.replayCamPos.find((c, i) => i !== index && c.tick === newTick);
    if (existing) {
        player.sendMessage("§cA camera point already exists at that time.");
        return;
    }

    SharedVariables.replayCamPos[index].tick = newTick;
    SharedVariables.replayCamRot[index].tick = newTick;

    player.sendMessage(`§aCamera point updated to ${newSeconds} second(s).`);
}

import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../main";
import { Player } from "@minecraft/server";

export async function editCameraPointTick(player: Player, index: number) {
    const oldTick = SharedVariables.replayCamPos[index].tick;

    const form = new ui.ModalFormData()
        .title("Edit Camera Point")
        .textField("Enter new tick value:", "e.g. 240", oldTick.toString());

    const response = await form.show(player);
    if (response.canceled) return;

    const newTick = parseInt(String(response.formValues[0]));

    if (isNaN(newTick)) {
        player.sendMessage("§cInvalid tick value.");
        return;
    }

    const existing = SharedVariables.replayCamPos.find((c, i) => i !== index && c.tick === newTick);
    if (existing) {
        player.sendMessage("§cA camera point already exists at that tick.");
        return;
    }

    SharedVariables.replayCamPos[index].tick = newTick;
    SharedVariables.replayCamRot[index].tick = newTick;

    player.sendMessage(`§aCamera point updated to tick ${newTick}.`);
}
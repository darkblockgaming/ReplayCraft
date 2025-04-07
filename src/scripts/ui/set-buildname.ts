import { ModalFormData } from "@minecraft/server-ui";
import { SharedVariables } from "../main";
import { doStart } from "../functions/replayControls/doStart";
import { Player } from "@minecraft/server";

export function setBuildName(player: Player) {
const form = new ModalFormData()
    .title("Set Your Replay Name.")
    .textField("Replay Name", "Enter your replay name here.")
    form
    .show(player)
    .then((formData) => {
        SharedVariables.buildName = formData.formValues[0] as string;
        doStart(player);
    })
    .catch((error: Error) => {
      player.sendMessage("Failed to show form: " + error);
      return -1;
    });

}
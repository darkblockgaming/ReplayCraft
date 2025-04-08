import { ModalFormData } from "@minecraft/server-ui";
import { SharedVariables } from "../main";
import { doStart } from "../functions/replayControls/doStart";
import { Player } from "@minecraft/server";

export function setBuildName(player: Player) {
const form = new ModalFormData()
    .title("replaycraftsetbuildname.title")
    .textField("replaycraftsetbuildname.textField", "replaycraftsetbuildname.textField2")
    form
    .show(player)
    .then((formData) => {
        SharedVariables.buildName = "rcData" + formData.formValues[0] as string;
        doStart(player);
    })
    .catch((error: Error) => {
      player.sendMessage("Failed to show form: " + error);
      return -1;
    });

}
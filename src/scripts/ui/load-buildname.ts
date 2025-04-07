import { ModalFormData } from "@minecraft/server-ui";
import { SharedVariables } from "../main";
import { Player } from "@minecraft/server";
import { loadFromDB } from "../functions/replayControls/load-from-database";

export function loadBuildName(player: Player) {
const form = new ModalFormData()
    .title("replaycraftloadbuildname.title") 
    .textField("replaycraftloadbuildname.textField", "replaycraftloadbuildname.textField2")
    form
    .show(player)
    .then((formData) => {
        SharedVariables.buildName = formData.formValues[0] as string;
        loadFromDB(player, SharedVariables.buildName, true);
    })
    .catch((error: Error) => {
      player.sendMessage("Failed to show form: " + error);
      return -1;
    });

}
import { ModalFormData } from "@minecraft/server-ui";
import { SharedVariables } from "../main";
import { Player } from "@minecraft/server";
import { loadFromDB } from "../functions/replayControls/load-from-database";

export function loadBuildName(player: Player) {
const form = new ModalFormData()
    .title("Enter Replay Name") 
    .textField("Replay name to be loaded?", "Enter your replay name here.")
    form
    .show(player)
    .then((formData) => {
        SharedVariables.buildName = formData.formValues[0] as string;
        loadFromDB(player, SharedVariables.buildName);
    })
    .catch((error: Error) => {
      player.sendMessage("Failed to show form: " + error);
      return -1;
    });

}
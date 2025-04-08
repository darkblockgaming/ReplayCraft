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
      if (typeof formData.formValues[0] === "string" && formData.formValues[0].trim() === "") {
        player.sendMessage({
            rawtext: [{
                translate: "replaycraftsetbuildname.error.message"
            }]
        });
        player.playSound("note.bass");
        return;
    }
        SharedVariables.buildName = "rcData" + formData.formValues[0] as string;
        doStart(player);
    })
    .catch((error: Error) => {
      console.error("Failed to show form: " + error);
      player.sendMessage({
        rawtext: [{
            translate: "replaycraft.ui.error.message"
        }]
    });
     
      return -1;
    });

}
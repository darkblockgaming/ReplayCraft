import { ModalFormData } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { cinematicListMap } from "../../../data/maps";
import { cinematicListDB } from "../../../cinematic";
import { panoramicCinematic } from "./panoramic-cinematic";
import { loadInstance } from "../../load-instance";

export function namePanorama(player: Player) {
    const form = new ModalFormData().title("rc2.title.cinematic.menu").textField("rc2.title.create.new.pano.cine.path", "rc2.textfield.name.pano.cine.path");

    form.show(player)
        .then((formData) => {
            const inputCinematicName = formData.formValues[0];
            const trimmedName = String(inputCinematicName ?? "").trim();

            if (trimmedName === "") {
                player.sendMessage({ rawtext: [{ translate: "rc2.mes.type.a.valid.cine.name" }] });
                player.playSound("note.bass");
                return;
            }

            const cinematicList = cinematicListMap.get(player.id);

            const cinematicName = `t${1}_cineData_${player.id}_${trimmedName}`; //t1 = panoramic

            if (!cinematicList.includes(cinematicName)) {
                cinematicList.push(cinematicName);

                //Update list in map and database
                cinematicListMap.set(player.id, cinematicList);
                cinematicListDB.set(player.id, cinematicList);

                loadInstance(player, cinematicName, 0);

                // open frame placement menu
                panoramicCinematic(player);
            } else {
                // TODO: handle duplicate name case
            }
        })
        .catch((error: Error) => {
            console.error("Failed to show form: " + error);
            player.sendMessage({ rawtext: [{ translate: "replaycraft.ui.error.message" }] });
            return -1;
        });
}

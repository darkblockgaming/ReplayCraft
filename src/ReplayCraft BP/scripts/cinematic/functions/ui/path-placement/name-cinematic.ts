import { ModalFormData } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { cinematicListMap } from "../../../data/maps";
import { framePlacementMenu } from "./frame-placement";
import { loadInstance } from "../../load-instance";
import { cinematicListDB } from "../../../cinematic";
import { CinematicBasicData } from "../../../data/types/types";
import { notifyPlayer } from "../../helpers/notify-player";
import { debugError } from "../../../../replay/data/util/debug";

export function nameCinematic(player: Player) {
    const form = new ModalFormData().title("rc2.title.cinematic.menu").textField("rc2.title.create.new.cine.path", "rc2.textfield.name.cine.path");

    form.show(player)
        .then((formData) => {
            const inputCinematicName = formData.formValues[0];
            const trimmedName = String(inputCinematicName ?? "").trim();

            if (trimmedName === "") {
                notifyPlayer(player, "rc2.mes.type.a.valid.cine.name", "note.bass");
                return;
            }

            const cinematicName = `cineData_${player.id}_${trimmedName}`;
            const cinematicType = "path_placement";

            const cinematicBasicData: CinematicBasicData = {
                name: cinematicName,
                type: cinematicType,
            };

            const cinematicList = cinematicListMap.get(player.id);
            if (!cinematicList.some((obj) => obj.name === cinematicName)) {
                cinematicList.push(cinematicBasicData);

                //Update list in map and database
                cinematicListMap.set(player.id, cinematicList);
                cinematicListDB.set(player.id, cinematicList);

                loadInstance(player, cinematicBasicData);

                // open frame placement menu
                framePlacementMenu(player);
            } else {
                // TODO: handle duplicate name case
            }
        })
        .catch((error: Error) => {
            debugError("Failed to show form: " + error);
            notifyPlayer(player, "rc1.ui.error.message");
            return -1;
        });
}

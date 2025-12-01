import { ModalFormData } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { cinematicListMap } from "../../../data/maps";
import { cinematicListDB } from "../../../cinematic";
import { panoramicCinematic } from "./panoramic-cinematic";
import { loadInstance } from "../../load-instance";
import { CinematicBasicData } from "../../../data/types/types";
import { notifyPlayer } from "../../helpers/notify-player";
import { debugError } from "../../../../replay/data/util/debug";

export function namePanorama(player: Player) {
    const form = new ModalFormData().title("rc2.title.cinematic.menu").textField("rc2.title.create.new.pano.cine.path", "rc2.textfield.name.pano.cine.path");

    form.show(player)
        .then((formData) => {
            const inputCinematicName = formData.formValues[0];
            const trimmedName = String(inputCinematicName ?? "").trim();

            if (trimmedName === "") {
                notifyPlayer(player, "rc2.mes.type.a.valid.cine.name");
                player.playSound("note.bass");
                return;
            }

            const cinematicName = `cineData_${player.id}_${trimmedName}`;
            const cinematicType = "panoramic";

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
                panoramicCinematic(player);
            } else {
                // TODO: handle duplicate name case
            }
        })
        .catch((error: Error) => {
            debugError("Failed to show form: " + error);
            notifyPlayer(player, "replaycraft.ui.error.message");
            return -1;
        });
}

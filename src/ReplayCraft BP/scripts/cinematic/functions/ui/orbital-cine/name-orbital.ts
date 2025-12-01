import { ModalFormData } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { cinematicListMap } from "../../../data/maps";
import { cinematicListDB } from "../../../cinematic";
import { orbitalCinematic } from "./orbital-cinematic";
import { loadInstance } from "../../load-instance";
import { CinematicBasicData } from "../../../data/types/types";
import { notifyPlayer } from "../../helpers/notify-player";
import { debugError } from "../../../../replay/data/util/debug";

export function nameOrbital(player: Player) {
    const form = new ModalFormData().title("rc2.title.cinematic.menu").textField("rc2.title.create.new.orbital.cine.path", "rc2.textfield.name.orbital.cine.path");

    form.show(player)
        .then((formData) => {
            const inputCinematicName = formData.formValues[0];
            const trimmedName = String(inputCinematicName ?? "").trim();

            if (trimmedName === "") {
                notifyPlayer(player, "rc2.mes.type.a.valid.cine.name", "note.bass");
                return;
            }

            const cinematicName = `cineData_${player.id}_${trimmedName}`;
            const cinematicType = "orbital";

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
                orbitalCinematic(player);
            } else {
                // TODO: handle duplicate name case
            }
        })
        .catch((error: Error) => {
            debugError("Failed to show form: " + error);
            player.sendMessage({ rawtext: [{ translate: "replaycraft.ui.error.message" }] });
            return -1;
        });
}

import { ModalFormData } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { cinematicListMap, cineRuntimeDataMap, frameDataMap } from "../../data/maps";
import { framePlacementMenu } from "./frame-placement";
import { cinematicFramesDB, cinematicListDB } from "../../cinematic";
import { clearOtherFrameEntities } from "../entity/clear-other-frame-entities";

export function nameCinematic(player: Player) {
    const form = new ModalFormData().title("rc2.title.cinematic.menu").textField("rc2.title.create.new.cine.path", "rc2.textfield.name.cine.path");

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

            const cinematicName = `cineData_${player.id}_${trimmedName}`;

            if (!cinematicList.includes(cinematicName)) {
                cinematicList.push(cinematicName);

                const cineRuntimeData = cineRuntimeDataMap.get(player.id);
                cineRuntimeData.loadedCinematic = cinematicName;
                cineRuntimeDataMap.set(player.id, cineRuntimeData);

                cinematicListMap.set(player.id, cinematicList);
                cinematicListDB.set(player.id, cinematicList);

                clearOtherFrameEntities(player);

                frameDataMap.set(cinematicName, cinematicFramesDB.get(cinematicName) ?? []);

                // open frame placement menu
                framePlacementMenu(player);
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

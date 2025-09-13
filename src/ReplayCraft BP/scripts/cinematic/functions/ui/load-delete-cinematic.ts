import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { cinematicListMap, cineRuntimeDataMap, frameDataMap } from "../../data/maps";
import { notifyPlayer } from "../helpers/notify-player";
import { refreshAllFrameEntities } from "../entity/refresh-all-frame-entities";
import { framePlacementMenu } from "./frame-placement";
import { cinematicFramesDB } from "../../cinematic";
import { clearOtherFrameEntities } from "../entity/clear-other-frame-entities";
//Import functions

export function loadCinematic(player: Player) {
    const cinematicList = cinematicListMap.get(player.id);

    if (cinematicList.length === 0) {
        notifyPlayer(player, "rc2.mes.no.cine.path.found", "note.bass");
        return;
    }

    const FIELD_INDEX = {
        selectedCinematic: 2,
    } as const;

    const form = new ModalFormData().title("rc2.title.cinematic.menu").divider().label("rc2.lebel.load.cine.path").dropdown("rc2.dropdown.select.cine.path", cinematicList, { defaultValueIndex: 0 }).divider().submitButton("rc2.button.load");

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "rc2.mes.please.click.submit", "note.bass");
            return;
        }

        clearOtherFrameEntities(player);
        //removeAllFrameEntities(player);

        const values = response.formValues;
        const selectedCinematic = Number(values[FIELD_INDEX.selectedCinematic]);

        const cinematicName = cinematicList[selectedCinematic];

        const cineRuntimeData = cineRuntimeDataMap.get(player.id);
        cineRuntimeData.loadedCinematic = cinematicName;
        cineRuntimeDataMap.set(player.id, cineRuntimeData);

        frameDataMap.set(cinematicName, cinematicFramesDB.get(cinematicName) ?? []);
        refreshAllFrameEntities(player);

        // open frame placement menu
        framePlacementMenu(player);
    });
}

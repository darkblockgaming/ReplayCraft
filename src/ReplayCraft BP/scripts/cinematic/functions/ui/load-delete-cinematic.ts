import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { cinematicListMap, cineRuntimeDataMap, frameDataMap } from "../../data/maps";
import { notifyPlayer } from "../helpers/notify-player";
import { refreshAllFrameEntities } from "../entity/refresh-all-frame-entities";
import { framePlacementMenu } from "./frame-placement";
import { cinematicFramesDB, cinematicListDB } from "../../cinematic";
import { clearOtherFrameEntities } from "../entity/clear-other-frame-entities";
//Import functions
// export function deleteCinematic(player: Player) {}

export function loadCinematic(player: Player) {
    const cinematicList = cinematicListMap.get(player.id);

    if (cinematicList.length === 0) {
        notifyPlayer(player, "rc2.mes.no.cine.path.found", "note.bass");
        return;
    }

    const FIELD_INDEX = {
        selectedCinematic: 2,
    } as const;

    // Build prefix to strip
    const prefix = `cineData_${player.id}_`;

    // Prepare display list (reversed + trimmed)
    const displayList = [...cinematicList].reverse().map((name) => (name.startsWith(prefix) ? name.slice(prefix.length) : name));

    const form = new ModalFormData().title("rc2.title.cinematic.menu").divider().label("rc2.lebel.load.cine.path").dropdown("rc2.dropdown.select.cine.path", displayList, { defaultValueIndex: 0 }).divider().submitButton("rc2.button.load");

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "rc2.mes.please.click.submit", "note.bass");
            return;
        }

        clearOtherFrameEntities(player);

        const values = response.formValues;
        const selectedIndex = Number(values[FIELD_INDEX.selectedCinematic]);

        // Get the actual cinematicName from original list
        const cinematicName = [...cinematicList].reverse()[selectedIndex];

        const cineRuntimeData = cineRuntimeDataMap.get(player.id);
        cineRuntimeData.loadedCinematic = cinematicName;
        cineRuntimeDataMap.set(player.id, cineRuntimeData);

        frameDataMap.set(cinematicName, cinematicFramesDB.get(cinematicName) ?? []);
        refreshAllFrameEntities(player);

        // open frame placement menu
        framePlacementMenu(player);
    });
}

export function deleteCinematic(player: Player) {
    const cinematicList = cinematicListMap.get(player.id);

    if (!cinematicList || cinematicList.length === 0) {
        notifyPlayer(player, "rc2.mes.no.cine.path.found", "note.bass");
        return;
    }

    const FIELD_INDEX = {
        selectedCinematic: 2,
        deleteAll: 3,
    } as const;

    const prefix = `cineData_${player.id}_`;

    // Prepare display list
    const displayList = [...cinematicList].reverse().map((name) => (name.startsWith(prefix) ? name.slice(prefix.length) : name));

    const form = new ModalFormData()
        .title("rc2.title.cinematic.menu")
        .divider()
        .label("rc2.lebel.delete.cine.path")
        .dropdown("rc2.dropdown.select.cine.path", displayList, { defaultValueIndex: 0 })
        .toggle({ translate: "rc2.toggle.delete.all" }, { defaultValue: false, tooltip: { translate: "rc2.toggle.tooltip.this.will.delete.all.cine" } })
        .divider()
        .submitButton("rc2.button.delete");

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "rc2.mes.please.click.submit", "note.bass");
            return;
        }

        const values = response.formValues;
        const selectedIndex = Number(values[FIELD_INDEX.selectedCinematic]);
        const deleteAll = values[FIELD_INDEX.deleteAll];

        //if deleteAll is true, wipe everything and exit
        if (deleteAll) {
            for (const cinematicName of cinematicList) {
                cinematicFramesDB.delete(cinematicName);
                frameDataMap.delete(cinematicName);
            }
            cinematicListMap.set(player.id, []);
            cinematicListDB.set(player.id, []);

            player.sendMessage({ rawtext: [{ translate: "rc2.mes.all.cine.deleted" }] });
            player.playSound("note.hat");
            return;
        }

        //selective deletion
        const cinematicName = [...cinematicList].reverse()[selectedIndex];

        // Remove from cinematicListMap and DB
        const updatedList = cinematicList.filter((name) => name !== cinematicName);
        cinematicListMap.set(player.id, updatedList);
        cinematicListDB.set(player.id, updatedList);

        // Remove from DBs
        cinematicFramesDB.delete(cinematicName);
        frameDataMap.delete(cinematicName);

        player.sendMessage({
            rawtext: [{ translate: "rc2.mes.cine.deleted" }, { text: `: ${displayList[selectedIndex]}` }],
        });
        player.playSound("note.hat");
    });
}

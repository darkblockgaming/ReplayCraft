import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { cinematicListMap, frameDataMap } from "../../data/maps";
import { notifyPlayer } from "../helpers/notify-player";
import { loadInstance } from "../load-instance";
import { panoramicCinematic } from "./panorama/panoramic-cinematic";
import { orbitalCinematic } from "./orbital-cine/orbital-cinematic";
import { framePlacementMenu } from "./path-placement/frame-placement";
import { cinematicFramesDB, cinematicListDB } from "../../cinematic";

export function loadCinematic(player: Player) {
    const cinematicList = cinematicListMap.get(player.id);

    if (!cinematicList || cinematicList.length === 0) {
        notifyPlayer(player, "rc2.mes.no.cine.path.found", "note.bass");
        return;
    }

    const prefixToRemove = `cineData_${player.id}_`;

    // Reverse order so newest appears first
    const reversedList = [...cinematicList].reverse();

    // Create display list (removing prefix)
    const displayList = reversedList.map((item) => (item.name.startsWith(prefixToRemove) ? item.name.slice(prefixToRemove.length) : item.name));

    // Build the form
    const form = new ModalFormData()
    .title("rc2.title.cinematic.menu")
    .divider()
    .label("rc2.lebel.load.cine.path")
    .dropdown("rc2.dropdown.select.cine.path", displayList, { defaultValueIndex: 0 })
    .divider()
    .submitButton("rc2.button.load");

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "rc2.mes.please.click.submit", "note.bass");
            return;
        }

        const selectedIndex = response.formValues[2] as number;
        const selectedCinematic = reversedList[selectedIndex];

        if (!selectedCinematic) {
            notifyPlayer(player, "rc2.mes.invalid.selection", "note.bass");
            return;
        }

        loadInstance(player, selectedCinematic);

        const cineType = selectedCinematic.type;
        if (cineType === "panoramic") {
            panoramicCinematic(player);
        } else if (cineType === "orbital") {
            orbitalCinematic(player);
        } else if (cineType === "path_placement") {
            framePlacementMenu(player);
        }
    });
}

export function deleteCinematic(player: Player) {
    const cinematicList = cinematicListMap.get(player.id);

    if (!cinematicList || cinematicList.length === 0) {
        notifyPlayer(player, "rc2.mes.no.cine.path.found", "note.bass");
        return;
    }

    const prefixToRemove = `cineData_${player.id}_`;

    // Reverse order so newest appears first
    const reversedList = [...cinematicList].reverse();

    // Create display list (removing prefix)
    const displayList = reversedList.map((item) => (item.name.startsWith(prefixToRemove) ? item.name.slice(prefixToRemove.length) : item.name));

    // Build the form
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

        const selectedIndex = response.formValues[2] as number;
        const isDeleteAll = response.formValues[3] as boolean;
        const selectedCinematic = reversedList[selectedIndex];

        if (isDeleteAll) {
            // Delete all cinematics for this player
            for (const cine of cinematicList) {
                cinematicFramesDB.delete(cine.name);
                frameDataMap.delete(cine.name);
            }

            cinematicListMap.set(player.id, []);
            cinematicListDB.set(player.id, []);

            player.sendMessage({ rawtext: [{ translate: "rc2.mes.all.cine.deleted" }] });
            player.playSound("note.hat");
            return;
        }

        if (!selectedCinematic) {
            notifyPlayer(player, "rc2.mes.invalid.selection", "note.bass");
            return;
        }

        // Delete only the selected cinematic
        const updatedList = cinematicList.filter((item) => item.name !== selectedCinematic.name);

        // Update maps & DBs
        cinematicListMap.set(player.id, updatedList);
        cinematicListDB.set(player.id, updatedList);

        frameDataMap.delete(selectedCinematic.name);
        cinematicFramesDB.delete(selectedCinematic.name);

        player.sendMessage({
            rawtext: [{ translate: "rc2.mes.cine.deleted" }, { text: `: ${displayList[selectedIndex]}` }],
        });
        player.playSound("note.hat");
    });
}

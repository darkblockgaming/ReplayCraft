//needs update

// import { Player } from "@minecraft/server";
// import { ModalFormData } from "@minecraft/server-ui";
// import { cinematicListMap, frameDataMap } from "../../data/maps";
// import { notifyPlayer } from "../helpers/notify-player";
// import { framePlacementMenu } from "./path-placement/frame-placement";
// import { cinematicFramesDB, cinematicListDB } from "../../cinematic";
// import { loadInstance } from "../load-instance";
// import { panoramicCinematic } from "./panorama/panoramic-cinematic";

// // Helper to detect type and format name
// function getCinematicInfo(player: Player, rawName: string) {
//     const prefix0 = `t0_cineData_${player.id}_`;
//     const prefix1 = `t1_cineData_${player.id}_`;

//     if (rawName.startsWith(prefix0)) {
//         return {
//             type: 0 as const,
//             display: rawName.slice(prefix0.length),
//         };
//     }
//     if (rawName.startsWith(prefix1)) {
//         return {
//             type: 1 as const,
//             display: `§e${rawName.slice(prefix1.length)}§r`,
//         };
//     }
//     // fallback if it doesn’t match either
//     return {
//         type: -1 as const,
//         display: rawName,
//     };
// }

// export function loadCinematic(player: Player) {
//     const cinematicList = cinematicListMap.get(player.id);

//     if (!cinematicList || cinematicList.length === 0) {
//         notifyPlayer(player, "rc2.mes.no.cine.path.found", "note.bass");
//         return;
//     }

//     const FIELD_INDEX = {
//         selectedCinematic: 2,
//     } as const;

//     // Extract info (type + display name)
//     const reversedList = [...cinematicList].reverse();
//     const cinematicInfoList = reversedList.map((name) => getCinematicInfo(player, name));
//     const displayList = cinematicInfoList.map((info) => info.display);

//     const form = new ModalFormData()
//         .title("rc2.title.cinematic.menu")
//         .divider()
//         .label("rc2.lebel.load.cine.path")
//         .dropdown("rc2.dropdown.select.cine.path", displayList, { defaultValueIndex: 0 })
//         .divider()
//         .submitButton("rc2.button.load");

//     form.show(player).then((response) => {
//         if (response.canceled) {
//             notifyPlayer(player, "rc2.mes.please.click.submit", "note.bass");
//             return;
//         }

//         const values = response.formValues;
//         const selectedIndex = Number(values[FIELD_INDEX.selectedCinematic]);

//         // Raw name and type info
//         const cinematicName = reversedList[selectedIndex];
//         const { type } = cinematicInfoList[selectedIndex];

//         // Load cinematic instance
//         loadInstance(player, cinematicName, type);

//         // Call the correct menu depending on type
//         if (type === 0) {
//             framePlacementMenu(player);
//         } else if (type === 1) {
//             panoramicCinematic(player);
//         }
//     });
// }


// export function deleteCinematic(player: Player) {
//     const cinematicList = cinematicListMap.get(player.id);

//     if (!cinematicList || cinematicList.length === 0) {
//         notifyPlayer(player, "rc2.mes.no.cine.path.found", "note.bass");
//         return;
//     }

//     const FIELD_INDEX = {
//         selectedCinematic: 2,
//         deleteAll: 3,
//     } as const;

//     // Reverse list and get type+display
//     const reversedList = [...cinematicList].reverse();
//     const cinematicInfoList = reversedList.map((name) => getCinematicInfo(player, name));
//     const displayList = cinematicInfoList.map((info) => info.display);

//     const form = new ModalFormData()
//         .title("rc2.title.cinematic.menu")
//         .divider()
//         .label("rc2.lebel.delete.cine.path")
//         .dropdown("rc2.dropdown.select.cine.path", displayList, { defaultValueIndex: 0 })
//         .toggle(
//             { translate: "rc2.toggle.delete.all" },
//             { defaultValue: false, tooltip: { translate: "rc2.toggle.tooltip.this.will.delete.all.cine" } }
//         )
//         .divider()
//         .submitButton("rc2.button.delete");

//     form.show(player).then((response) => {
//         if (response.canceled) {
//             notifyPlayer(player, "rc2.mes.please.click.submit", "note.bass");
//             return;
//         }

//         const values = response.formValues;
//         const selectedIndex = Number(values[FIELD_INDEX.selectedCinematic]);
//         const deleteAll = values[FIELD_INDEX.deleteAll];

//         // if deleteAll is true, wipe everything and exit
//         if (deleteAll) {
//             for (const cinematicName of cinematicList) {
//                 cinematicFramesDB.delete(cinematicName);
//                 frameDataMap.delete(cinematicName);
//             }
//             cinematicListMap.set(player.id, []);
//             cinematicListDB.set(player.id, []);

//             player.sendMessage({ rawtext: [{ translate: "rc2.mes.all.cine.deleted" }] });
//             player.playSound("note.hat");
//             return;
//         }

//         // selective deletion
//         const cinematicName = reversedList[selectedIndex];

//         // Remove from cinematicListMap and DB
//         const updatedList = cinematicList.filter((name) => name !== cinematicName);
//         cinematicListMap.set(player.id, updatedList);
//         cinematicListDB.set(player.id, updatedList);

//         // Remove from DBs
//         cinematicFramesDB.delete(cinematicName);
//         frameDataMap.delete(cinematicName);

//         player.sendMessage({
//             rawtext: [
//                 { translate: "rc2.mes.cine.deleted" },
//                 { text: `: ${displayList[selectedIndex]}` },
//             ],
//         });
//         player.playSound("note.hat");
//     });
// }


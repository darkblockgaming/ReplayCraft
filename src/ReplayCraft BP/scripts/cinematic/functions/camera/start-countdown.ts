// import { Player, system } from "@minecraft/server";
// import { otherDataMap } from "../../data/maps";

// export function startCountdown(player: Player) {
//     //const settingsData = settingsDataMap.get(player.id);
//     // player.camera.fade({
//     //     fadeTime: {
//     //         fadeInTime: 0,
//     //         holdTime: 2.5,
//     //         fadeOutTime: 0.5
//     //     },
//     //     fadeColor: {
//     //         red: settingsData.cineRedValue,
//     //         green: settingsData.cineGreenValue,
//     //         blue: settingsData.cineBlueValue
//     //     }
//     // });
//     player.onScreenDisplay.setTitle("Get ready!", {
//         stayDuration: 45,
//         fadeInDuration: 0,
//         fadeOutDuration: 10,
//         subtitle: "3",
//     });
//     player.playSound("note.bell");
//     player.playSound("note.cow_bell");
//     let countdown = 3;
//     const intervalId = system.runInterval(() => {
//         const otherData = otherDataMap.get(player.id);
//         if (otherData.isCameraInMotion === false) {
//             system.clearRun(intervalId);
//             player.onScreenDisplay.setTitle("Stopped!", {
//                 stayDuration: 10,
//                 fadeInDuration: 0,
//                 fadeOutDuration: 0,
//                 subtitle: "-- -.--",
//             });
//             return;
//         }
//         countdown--;
//         player.onScreenDisplay.updateSubtitle(countdown.toString());
//         if (countdown !== 0) {
//             player.playSound("note.cow_bell");
//         }
//         if (countdown <= 0) {
//             system.clearRun(intervalId);
//         }
//     }, 20);
// }

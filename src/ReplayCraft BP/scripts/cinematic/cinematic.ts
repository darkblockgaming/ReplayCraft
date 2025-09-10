import { world } from "@minecraft/server";
//Import maps
import { frameDataMap, cineRuntimeDataMap, settingsDataMap } from "./data/maps";

//Import Functions
import { framePlacementMenu } from "./functions/ui/frame-placement";
import { cameraPlaybackMenu } from "./functions/ui/camera-playback-menu";
import { OptimizedDatabase } from "../replay/data/data-hive";
import { frameManagementMenu } from "./functions/ui/manage-frames";

const cineUiHandlers = {
    framePlacementMenu: framePlacementMenu,
    cameraPlaybackMenu: cameraPlaybackMenu,
    frameManagementMenu: frameManagementMenu,
};

//Initialise DataBase(s)
export let cinematicFramesDB: OptimizedDatabase;
export let cinematicSettingsDB: OptimizedDatabase;

world.afterEvents.worldLoad.subscribe(() => {
    cinematicFramesDB = new OptimizedDatabase("cinematicFramesData");
    cinematicSettingsDB = new OptimizedDatabase("cinematicSettingsData");
});

//ItemUse event
world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (!itemStack || itemStack.typeId !== "minecraft:stick" || !/^(cinematic|replaycraft1)$/i.test(itemStack.nameTag)) return;

    frameDataMap.set(source.id, cinematicFramesDB.get(source.id) ?? []);

    settingsDataMap.set(
        source.id,
        cinematicSettingsDB.get(source.id) ?? {
            hideHud: true,
            easeType: 0,
            easetime: 4,
            camFacingType: 0,
            camFacingX: 0,
            camFacingY: 0,
            cinePrevSpeed: 0.5,
            cinePrevSpeedMult: 5,
        }
    );

    const runtimeDefaults = {
        state: "framePlacementMenu",
        isCameraInMotion: false,
    };

    const cineRuntimeData = cineRuntimeDataMap.get(source.id) ?? runtimeDefaults;
    cineRuntimeDataMap.set(source.id, cineRuntimeData);

    const handler = cineUiHandlers[cineRuntimeData.state as keyof typeof cineUiHandlers] ?? cineUiHandlers.framePlacementMenu;

    handler(source);
});

//Frame Particles Loop
// system.runInterval(() => {
//     for (const player of world.getAllPlayers()) {
//         const frames = frameDataMap.get(player.id) ?? [];

//         const otherData = otherDataMap.get(player.id);
//         const settingsData = settingsDataMap.get(player.id);

//         if (!frames.length || !settingsData.cineParSwitch || otherData.isCameraInMotion) {
//             continue;
//         }
//         const partSelected = particlesStr[settingsData.cineParType];

//         frames.map((frame: FrameData) => {
//             player.runCommand(`particle ${partSelected} ${frame.pos.x} ${frame.pos.y} ${frame.pos.z}`);
//         });
//     }
// }, 8);

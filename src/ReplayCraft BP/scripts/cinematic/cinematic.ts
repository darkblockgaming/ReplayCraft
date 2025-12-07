import { Player, world } from "@minecraft/server";
//Import maps
import { cinematicListMap, cineRuntimeDataMap } from "./data/maps";

//Import Functions
import { framePlacementMenu } from "./functions/ui/path-placement/frame-placement";
import { cameraPlaybackMenu } from "./functions/ui/path-placement/camera-playback-menu";
import { OptimizedDatabase } from "../replay/data/data-hive";
import { frameManagementMenu } from "./functions/ui/path-placement/manage-frames";
import { cineMainMenu } from "./functions/ui/cine-main-menu";
import { panoramicCinematic } from "./functions/ui/panorama/panoramic-cinematic";
import { CineRuntimeData } from "./data/types/types";
import { orbitalCinematic } from "./functions/ui/orbital-cine/orbital-cinematic";

const cineUiHandlers = {
    cineMainMenu: (player: Player) => cineMainMenu(player),
    framePlacementMenu: (player: Player) => framePlacementMenu(player),
    cameraPlaybackMenu: (player: Player) => cameraPlaybackMenu(player),
    frameManagementMenu: (player: Player) => frameManagementMenu(player),
    panoramicCinematic: (player: Player) => panoramicCinematic(player),
    orbitalCinematic: (player: Player) => orbitalCinematic(player),
};

//Initialise DataBase(s)
export let cinematicListDB: OptimizedDatabase;
export let cinematicFramesDB: OptimizedDatabase;
export let cinematicSettingsDB: OptimizedDatabase;

world.afterEvents.worldLoad.subscribe(() => {
    cinematicListDB = new OptimizedDatabase("cinematicList");
    cinematicFramesDB = new OptimizedDatabase("cinematicFramesData");
    cinematicSettingsDB = new OptimizedDatabase("cinematicSettingsData");
});

//ItemUse event
world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (!itemStack || itemStack?.typeId !== "minecraft:stick" || !/^(cinematic|replaycraft1)$/i.test(itemStack.nameTag)) return;

    // get saved data or init defaults
    const cinematicList = cinematicListDB.get(source.id) ?? [];
    cinematicListMap.set(source.id, cinematicList);

    const runtimeDefaults: CineRuntimeData = {
        state: "cineMainMenu",
        isCameraInMotion: false,
        loadedCinematicType: "none",
    };

    const cineRuntimeData = cineRuntimeDataMap.get(source.id) ?? runtimeDefaults;
    cineRuntimeDataMap.set(source.id, cineRuntimeData);

    //show the ui depending on the ui state
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

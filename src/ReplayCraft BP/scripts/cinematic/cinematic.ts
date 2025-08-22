import { world, system } from "@minecraft/server";
//Import maps
import { uiStateMap, frameDataMap, settingsDataMap, otherDataMap } from "./data/maps";
//Import types
import { FrameData } from "./data/types/types";
//Import constants
import { particlesStr } from "./data/constants/constants";
//Import Functions
import { initMaps } from "./data/init-maps";
import { framePlacementMenu } from "./functions/ui/frame-placement";
import { cameraPlaybackMenu } from "./functions/ui/camera-playback-menu";

const cineUiHandlers = {
    framePlacementMenu: framePlacementMenu,
    cameraPlaybackMenu: cameraPlaybackMenu,
};

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (itemStack?.typeId === "minecraft:blaze_rod" || (itemStack?.typeId === "minecraft:stick" && /^(Cinematic|cinematic|CINEMATIC|ReplayCraft1|replaycraft1|REPLAYCRAFT1|Replaycraft1)$/.test(itemStack.nameTag))) {
        initMaps(source);

        const uiState = uiStateMap.get(source.id);
        const handler = cineUiHandlers[uiState.state as keyof typeof cineUiHandlers];
        if (handler) {
            handler(source);
        } else {
            console.warn("Invalid State:", uiState.state);
            uiState.state = "framePlacementMenu";
        }
    }
});

//Frame Particles Loop
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const frames = frameDataMap.get(player.id) ?? [];

        const otherData = otherDataMap.get(player.id);
        const settingsData = settingsDataMap.get(player.id);

        if (!frames.length || !settingsData.cineParSwitch || otherData.isCameraInMotion) {
            continue;
        }
        const partSelected = particlesStr[settingsData.cineParType];

        frames.map((frame: FrameData) => {
            player.runCommand(`particle ${partSelected} ${frame.pos.x} ${frame.pos.y} ${frame.pos.z}`);
        });
    }
}, 8);

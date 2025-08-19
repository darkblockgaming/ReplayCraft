import { world, system } from "@minecraft/server";
//Import maps
import { frameDataMap, settingsDataMap, otherDataMap } from "./data/maps";
//Import types
import { FrameData } from "./data/types/types";
//Import constants
import { particlesStr } from "./data/constants/constants";
//Import Functions
import { initMaps } from "./data/init-maps";
import { cinematicUi } from "./functions/ui/cinematic-ui";

world.afterEvents.itemUse.subscribe((eventData) => {
    const player = eventData.source;
    if (eventData.itemStack?.typeId === "minecraft:blaze_rod" || (eventData.itemStack?.typeId === "minecraft:stick" && /^(Cinematic|cinematic|CINEMATIC|ReplayCraft1|replaycraft1|REPLAYCRAFT1|Replaycraft1)$/.test(eventData.itemStack.nameTag))) {
        cinematicUi(player);
        initMaps(player);
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

import { Player } from "@minecraft/server";
import { frameDataMap, cineRuntimeDataMap } from "../data/maps";
import { removeAllFrameEntities } from "./entity/remove-all-frame-entities";
import { cinematicFramesDB } from "../cinematic";

export function removeAllFrames(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];
    
    if (cineRuntimeData.isCameraInMotion === true) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "rc2.mes.cannot.remove.all.frames.while.camera.is.in.motion",
        });
        return;
    }

    if (frames.length === 0) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "rc2.mes.no.frames.to.remove",
        });
        return;
    }
    removeAllFrameEntities(player);

    frameDataMap.set(cineRuntimeData.loadedCinematic, []);
    cinematicFramesDB.set(cineRuntimeData.loadedCinematic, []);

    player.sendMessage({
        translate: "rc2.mes.all.frames.have.been.removed",
    });
}

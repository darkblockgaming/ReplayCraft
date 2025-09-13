import { Player, world } from "@minecraft/server";
import { frameDataMap, cineRuntimeDataMap } from "../data/maps";
import { cinematicFramesDB } from "../cinematic";

export function removeLastFrame(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];

    if (cineRuntimeData.isCameraInMotion === true) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "rc2.mes.cannot.remove.last.frame.while.camera.is.in.motion",
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

    const entityId = frames[frames.length - 1].entityId;
    const entity = world.getEntity(entityId);
    entity?.remove();

    frames.pop();
    frameDataMap.set(cineRuntimeData.loadedCinematic, frames);
    cinematicFramesDB.set(cineRuntimeData.loadedCinematic, frames);

    player.sendMessage({
        translate: "rc2.mes.removed.last.frame",
    });
}

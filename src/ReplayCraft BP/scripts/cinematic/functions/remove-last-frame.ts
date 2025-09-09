import { Player, world } from "@minecraft/server";
import { frameDataMap, cineRuntimeDataMap } from "../data/maps";
import { cinematicFramesDB } from "../cinematic";

export function removeLastFrame(player: Player) {
    const frames = frameDataMap.get(player.id) ?? [];

    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    if (cineRuntimeData.isCameraInMotion === true) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "dbg.rc2.mes.cannot.remove.last.frame.while.camera.is.in.motion",
        });
        return;
    }
    if (frames.length === 0) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "dbg.rc2.mes.no.frames.to.remove",
        });
        return;
    }

    const entityId = frames[frames.length - 1].entityId;
    const entity = world.getEntity(entityId);
    entity?.remove();

    frames.pop();
    frameDataMap.set(player.id, frames);
    cinematicFramesDB.set(player.id, frames);

    player.sendMessage({
        translate: "dbg.rc2.mes.removed.last.frame",
    });
}

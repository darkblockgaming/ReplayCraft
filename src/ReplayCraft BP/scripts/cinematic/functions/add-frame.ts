import { Player } from "@minecraft/server";
import { frameDataMap, cineRuntimeDataMap } from "../data/maps";
import { FrameData } from "../data/types/types";
import { spawnFrameEntity } from "./entity/spawn-frame-entity";
import { refreshAllFrameEntities } from "./entity/refresh-all-frame-entities";
import { cinematicFramesDB } from "../cinematic";

export function addCameraFrame(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    if (cineRuntimeData?.isCameraInMotion) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "dbg.rc2.mes.cannot.add.frames.while.camera.is.in.motion",
        });
        return;
    }
    refreshAllFrameEntities(player);
    const pos = player.getHeadLocation();
    const rot = player.getRotation();

    const frames = frameDataMap.get(player.id) ?? [];

    // the new frame will be at index = frames.length
    const entity = spawnFrameEntity(player, pos, rot, frames.length);

    const frame: FrameData = {
        pos,
        rot,
        entityId: entity.id,
    };

    frames.push(frame);
    frameDataMap.set(player.id, frames);
    cinematicFramesDB.set(player.id, frames);
}

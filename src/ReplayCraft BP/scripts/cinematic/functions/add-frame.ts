import { Player } from "@minecraft/server";
import { frameDataMap, cineRuntimeDataMap } from "../data/maps";
import { FrameData } from "../data/types/types";
import { spawnFrameEntity } from "./entity/spawn-frame-entity";
import { refreshAllFrameEntities } from "./entity/refresh-all-frame-entities";
import { cinematicFramesDB } from "../cinematic";
import { clearOtherFrameEntities } from "./entity/clear-other-frame-entities";

export function addCameraFrame(player: Player, isFocusPoint: boolean = false) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    if (cineRuntimeData?.isCameraInMotion) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "rc2.mes.cannot.add.frames.while.camera.is.in.motion",
        });
        return;
    }
    refreshAllFrameEntities(player);
    const pos = player.getHeadLocation();
    const rot = player.getRotation();

    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];

    // the new frame will be at index = frames.length
    if (isFocusPoint) {
        clearOtherFrameEntities(player);
    }
    const entity = spawnFrameEntity(player, pos, rot, frames.length, isFocusPoint);

    const frame: FrameData = {
        pos,
        rot,
        entityId: entity.id,
    };

    if (isFocusPoint) {
        frames[0] = frame;
    } else {
        frames.push(frame);
    }

    frameDataMap.set(cineRuntimeData.loadedCinematic, frames);
    cinematicFramesDB.set(cineRuntimeData.loadedCinematic, frames);
}

import { Player } from "@minecraft/server";
import { frameDataMap, otherDataMap } from "../data/maps";
import { FrameData } from "../data/types/types";
import { spawnFrameEntity } from "./entity/spawn-frame-entity";
import { refreshAllFrameEntities } from "./entity/refresh-all-frame-entities";

export function addCameraFrame(player: Player) {
    const otherData = otherDataMap.get(player.id);
    if (otherData?.isCameraInMotion) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "dbg.rc2.mes.cannot.add.frames.while.camera.is.in.motion",
        });
        return;
    }
    refreshAllFrameEntities(player);
    const pos = player.getHeadLocation();
    const rot = player.getRotation();

    // ensure a stable array for this player
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
}

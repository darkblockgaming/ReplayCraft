import { Player } from "@minecraft/server";
import { frameDataMap, otherDataMap } from "../data/maps";
import { FrameData } from "../data/types/types";

export function addCameraFrame(player: Player) {
    const otherData = otherDataMap.get(player.id);
    if (otherData.isCameraInMotion === true) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "dbg.rc2.mes.cannot.add.frames.while.camera.is.in.motion",
        });
        return;
    }

    const pos = player.getHeadLocation();
    const rot = player.getRotation();

    //TODO: Spawn entity to represent the camera position at pos facing at rot

    const frame: FrameData = {
        pos: pos,
        rot: rot,
    };

    const frames = frameDataMap.get(player.id) ?? [];
    frames.push(frame);
    frameDataMap.set(player.id, frames);
}

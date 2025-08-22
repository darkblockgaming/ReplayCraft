import { Player, VanillaEntityIdentifier } from "@minecraft/server";
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

    const frame: FrameData = {
        pos: pos,
        rot: rot,
    };

    const frames = frameDataMap.get(player.id) ?? [];
    frames.push(frame);

    const camPosEntity = player.dimension.spawnEntity("dbg:rccampos" as VanillaEntityIdentifier, pos);
    camPosEntity.nameTag = `Camera Frame ${frames.length}`;
    camPosEntity.setProperty("rc:rot_x", player.getRotation().x);
    camPosEntity.setProperty("rc:rot_y", player.getRotation().y);
    camPosEntity.addTag("cinematicOwner:" + player.id);
}

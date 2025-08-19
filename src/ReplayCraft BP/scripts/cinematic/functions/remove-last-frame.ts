import { Player } from "@minecraft/server";
import { frameDataMap, otherDataMap } from "../data/maps";

export function removeLastFrame(player: Player) {
    const frames = frameDataMap.get(player.id) ?? [];

    const otherData = otherDataMap.get(player.id);
    if (otherData.isCameraInMotion === true) {
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
    frames.pop();
    player.sendMessage({
        translate: "dbg.rc2.mes.removed.last.frame",
    });
}

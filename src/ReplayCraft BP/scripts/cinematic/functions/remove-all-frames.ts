import { Player } from "@minecraft/server";
import { frameDataMap, cineRuntimeDataMap } from "../data/maps";
import { removeAllFrameEntities } from "./entity/remove-all-frame-entities";
import { cinematicFramesDB } from "../cinematic";
import { notifyPlayer } from "./helpers/notify-player";

export function removeAllFrames(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];

    if (cineRuntimeData.isCameraInMotion === true) {
        notifyPlayer(player, "rc2.mes.cannot.remove.all.frames.while.camera.is.in.motion", "note.bass");
        return;
    }

    if (frames.length === 0) {
        notifyPlayer(player, "rc2.mes.no.frames.to.remove", "note.bass");
        return;
    }
    removeAllFrameEntities(player);

    frameDataMap.set(cineRuntimeData.loadedCinematic, []);
    cinematicFramesDB.set(cineRuntimeData.loadedCinematic, []);

    notifyPlayer(player, "rc2.mes.all.frames.have.been.removed");
}

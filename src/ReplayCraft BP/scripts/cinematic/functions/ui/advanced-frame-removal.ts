import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { frameDataMap } from "../../data/maps";
import { notifyPlayer } from "../helpers/notify-player";
import { cinematicFramesDB } from "../../cinematic";
import { refreshAllFrameEntities } from "../entity/refresh-all-frame-entities";

export function advancedFrameRemoval(player: Player) {
    const frames = frameDataMap.get(player.id) ?? [];
    if (frames.length === 0) {
        player.playSound("note.bass");
        player.sendMessage({ translate: "dbg.rc2.mes.no.frames.to.remove" });
        return;
    }

    const FIELD_INDEX = {
        selectedFrame: 2,
    } as const;

    const form = new ModalFormData()
        .title("dbg.rc2.title.advanced.frame.removal")
        .divider()
        .label("dbg.rc2.lebel.selective.removal")
        .slider({ rawtext: [{ translate: "dbg.rc2.slider.select.a.frame" }] }, 1, frames.length, {
            valueStep: 1,
            defaultValue: frames.length,
        })
        .divider();

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "dbg.rc2.mes.please.click.submit");
            return;
        }

        const values = response.formValues;
        const selectedFrame = Number(values[FIELD_INDEX.selectedFrame]);

        if (selectedFrame < 1) return;

        const index = selectedFrame - 1;
        const entityId = frames[index]?.entityId;

        if (entityId) {
            world.getEntity(entityId)?.remove();
        }

        frames.splice(index, 1);
        frameDataMap.set(player.id, frames);
        cinematicFramesDB.set(player.id, frames);

        refreshAllFrameEntities(player);

        notifyPlayer(player, "dbg.rc2.mes.settings.have.been.saved.successfully", "random.orb");
    });
}

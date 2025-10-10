import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { cineRuntimeDataMap, frameDataMap } from "../../../data/maps";
import { notifyPlayer } from "../../helpers/notify-player";
import { cinematicFramesDB } from "../../../cinematic";
import { refreshAllFrameEntities } from "../../entity/refresh-all-frame-entities";

export function panoramaSettings(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    const frames = frameDataMap.get(cineRuntimeData.loadedCinematic) ?? [];

    const FIELD_INDEX = {
        selectedFrame: 2,
    } as const;

    const form = new ModalFormData()
        .title("rc2.title.pano.type")
        .divider()
        .label("rc2.lebel.facing.orientation")
        .label("rc2.lebel.C")
        //.dropdown({ rawtext: [{ translate: "rc2.dropdown.camera.faces.towards" }] }, [{ rawtext: [{ translate: "rc2.dropdown.value.faces.towards.focus.point" }] }, { rawtext: [{ translate: "rc2.dropdown.value.faces.away.from.focus.point" }] }], { defaultValueIndex: 0 })
        // .slider({ rawtext: [{ translate: "rc2.slider.select.a.frame" }] }, 1, frames.length, {
        //     valueStep: 1,
        //     defaultValue: frames.length,
        // })
        .divider();

    form.show(player).then((response) => {
        if (response.canceled) {
            notifyPlayer(player, "rc2.mes.please.click.submit");
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
        frameDataMap.set(cineRuntimeData.loadedCinematic, frames);
        cinematicFramesDB.set(cineRuntimeData.loadedCinematic, frames);

        refreshAllFrameEntities(player, "panoramic");

        player.sendMessage({
            rawtext: [{ translate: "rc2.mes.removed.frame.no" }, { text: `: ${index + 1}` }],
        });
    });
}

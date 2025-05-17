import { SharedVariables } from "../main";
import * as ui from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { clearStructure } from "../functions/clearStructure";
import { loadEntity } from "../functions/loadEntity";
import { loadBlocksUpToTick } from "../functions/loadBlocksUpToTick";
import { removeEntities } from "../functions/removeEntities";

export function loadFrameTicksForm(player: Player) {
    const currentTick = SharedVariables.wantLoadFrameTick;
    const maxTick = SharedVariables.dbgRecTime;

    // Determine last camera point tick or fallback to 0
    const lastCamTick = SharedVariables.replayCamPos.length > 0
        ? Math.max(...SharedVariables.replayCamPos.map(c => c.tick))
        : 0;

    // Slider min is last camera point tick, max is full recording length
    const sliderMin = lastCamTick;
    const sliderMax = maxTick;

    // Clamp currentTick between sliderMin and sliderMax
    const defaultSlider = Math.max(sliderMin, Math.min(currentTick, sliderMax));

    const replaySettingsForm = new ui.ModalFormData()
        .title("Load Frames - Ticks")
        .slider(
            "This is the most accurate way of loading frames.\n\nSelect Frame (Ticks)",
            sliderMin,
            sliderMax,
            {
                valueStep: 1,
                defaultValue: defaultSlider
            }
        )
        .textField("Enter Frame Tick", "Enter Frame Tick", {
            defaultValue: `${lastCamTick}`
        });

    replaySettingsForm.show(player).then(async (response) => {
        if (response.canceled || !response.formValues) return;

        const sliderTick = Number(response.formValues[0]);
        const textTick = Number(response.formValues[1]);

        const selectedTick = isNaN(textTick) || sliderTick > textTick ? sliderTick : textTick;
        SharedVariables.wantLoadFrameTick = Math.min(Math.max(selectedTick, sliderMin), sliderMax);

        removeEntities(player, true);

        SharedVariables.frameLoaded = true;

        await Promise.all(SharedVariables.multiPlayers.map(async (p) => {
            await clearStructure(p);
        }));

        await Promise.all(SharedVariables.multiPlayers.map(async (p) => {
            await loadEntity(p);
            await loadBlocksUpToTick(SharedVariables.wantLoadFrameTick, p);
        }));
    });
}

import { SharedVariables } from "../main";
import * as ui from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { clearStructure } from "../functions/clearStructure";
import { loadEntity } from "../functions/loadEntity";
import { loadBlocksUpToTick } from "../functions/loadBlocksUpToTick";
import { removeEntities } from "../functions/removeEntities";

export function loadFrameSecondsForm(player: Player) {
    const totalTicks = SharedVariables.dbgRecTime;
    const totalSeconds = Math.floor(totalTicks / 20);
    const currentSeconds = Math.floor(SharedVariables.wantLoadFrameTick / 20);

    // Find last camera point tick or fallback to 0
    const lastCamTick = SharedVariables.replayCamPos.length > 0
        ? Math.max(...SharedVariables.replayCamPos.map(c => c.tick))
        : 0;
    const lastCamSeconds = Math.floor(lastCamTick / 20);

    // Slider min is the last camera point in seconds, max is totalSeconds
    const sliderMin = lastCamSeconds;
    const sliderMax = totalSeconds;

    // Clamp currentSeconds between sliderMin and sliderMax
    const defaultSlider = Math.max(sliderMin, Math.min(currentSeconds, sliderMax));

    // Update wantLoadFrameTick accordingly
    SharedVariables.wantLoadFrameTick = Math.min(SharedVariables.wantLoadFrameTick, totalTicks);

    const form = new ui.ModalFormData()
        .title("Load Frames - Seconds")
        .slider(
            `These values are slightly rounded off.\n§bAccurate time: §r${(totalTicks / 20).toFixed(2)}\n\nSelect Frame (Secs)`,
            sliderMin,
            sliderMax,
            {
                valueStep: 1,
                defaultValue: defaultSlider
            }
        )
        .textField("Enter Frame Seconds", "Enter Frame Seconds", {
            defaultValue: `${lastCamSeconds}`
        });

    form.show(player).then(async (response) => {
        if (response.canceled || !response.formValues) return;

        const sliderVal = Number(response.formValues[0]);
        const textVal = Number(response.formValues[1]);

        const selectedSeconds = isNaN(textVal) || sliderVal > textVal ? sliderVal : textVal;
        SharedVariables.wantLoadFrameTick = Math.min(Math.round(selectedSeconds * 20), totalTicks);
        SharedVariables.frameLoaded = true;

        removeEntities(player, true);

        await Promise.all(SharedVariables.multiPlayers.map(async (p) => {
            await clearStructure(p);
        }));

        await Promise.all(SharedVariables.multiPlayers.map(async (p) => {
            await loadEntity(p);
            await loadBlocksUpToTick(SharedVariables.wantLoadFrameTick, p);
        }));
    });
}

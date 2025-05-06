import { SharedVariables } from "../main";
import * as ui from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { clearStructure } from "../functions/clearStructure";
import { loadEntity } from "../functions/loadEntity";
import { loadBlocksUpToTick } from "../functions/loadBlocksUpToTick";
import { removeEntities } from "../functions/removeEntities";

export function loadFrameSecondsForm(player: Player) {
    const maxFrameSeconds = Math.floor(SharedVariables.dbgRecTime / 20);
    const totalTicks = SharedVariables.dbgRecTime;
    const currentSeconds = Math.floor(SharedVariables.wantLoadFrameTick / 20);

    const form = new ui.ModalFormData()
        .title("Load Frames - Seconds")
        .slider(
            `These values are slightly rounded off.\n§bAccurate time: §r${(SharedVariables.dbgRecTime / 20).toFixed(2)}\n\nSelect Frame (Secs)`,
            SharedVariables.startingValueSecs,
            maxFrameSeconds,
            {
              valueStep: 1,
              defaultValue: currentSeconds
            }
          )
          .textField("Enter Frame Seconds","Enter Frame Seconds",
            {
              defaultValue: `${currentSeconds}`
            }
          )

    form.show(player).then(async (response) => {
        if (response.canceled || !response.formValues) return;

        const sliderVal = Number(response.formValues[0]);
        const textVal = Number(response.formValues[1]);

        // If the slider value is higher than the textbox or textbox is invalid, prefer slider
        const selectedSeconds = isNaN(textVal) || sliderVal > textVal ? sliderVal : textVal;

        SharedVariables.wantLoadFrameTick = Math.min(Math.round(selectedSeconds * 20), totalTicks);

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

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

    const replaySettingsForm = new ui.ModalFormData()
        .title("Load Frames - Ticks")
        .slider(
            "This is the most accurate way of loading frames.\n\nSelect Frame (Ticks)",
            SharedVariables.startingValueTick,
            maxTick,
            1,
            currentTick
        )
        .textField("Enter Frame Tick", "Enter Frame Tick", `${currentTick}`);

    replaySettingsForm.show(player).then(async (response) => {
        if (response.canceled || !response.formValues) return;

        const sliderTick = Number(response.formValues[0]);
        const textTick = Number(response.formValues[1]);

        const selectedTick = isNaN(textTick) || sliderTick > textTick ? sliderTick : textTick;
        SharedVariables.wantLoadFrameTick = Math.min(selectedTick, maxTick);

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

import { SharedVariables } from "../../main";
import * as ui from "@minecraft/server-ui";
import { clearStructure } from "../clearStructure";
import { loadEntity } from "../loadEntity";
import { loadBlocksUpToTick } from "../loadBlocksUpToTick";

export function loadFrameSecondsForm(player) {
    const maxFrameSeconds = Math.floor(SharedVariables.dbgRecTime / 20);
    const totalTicks = SharedVariables.dbgRecTime;
    const form = new ui.ModalFormData()
        .title("Load Frames - Seconds")
        .slider(`These values are slightly rounded off.\n§bAccurate time: §r${(Math.round((SharedVariables.dbgRecTime / 20) * 100) / 100).toFixed(2)}\n\nSelect Frame (Secs)`, SharedVariables.startingValueSecs, maxFrameSeconds, 1, Math.floor(SharedVariables.wantLoadFrameTick / 20));

    form.show(player).then(async (response) => {
        if (response.canceled || !response.formValues) return;

        const selectedSeconds = response.formValues[0];
        SharedVariables.wantLoadFrameTick = Math.round((selectedSeconds / maxFrameSeconds) * totalTicks);

        const replayEntities = player.dimension.getEntities({ type: "dbg:replayentity" });
        replayEntities.forEach((entity) => entity.remove());

        // Step 1: Clear structures before loading new ones
        SharedVariables.frameLoaded = true;
        await Promise.all(SharedVariables.multiPlayers.map(async (player) => {
            await clearStructure(player);
        }));

        // Step 2: Load entities and blocks after clearing structures
        await Promise.all(SharedVariables.multiPlayers.map(async (player) => {
            await loadEntity(player);
            await loadBlocksUpToTick(SharedVariables.wantLoadFrameTick, player);
        }));
    });
}

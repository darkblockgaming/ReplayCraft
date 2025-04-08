import { SharedVariables } from "../main";
import * as ui from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { clearStructure } from "../functions/clearStructure";
import { loadEntity } from "../functions/loadEntity";
import { loadBlocksUpToTick } from "../functions/loadBlocksUpToTick";
export function loadFrameTicksForm(player: Player) {
    const replaySettingsForm = new ui.ModalFormData().title("Load Frames - Ticks");
    replaySettingsForm.slider("This is most accurate way of loading frames.\n\nSelect Frame (Ticks)",
        SharedVariables.startingValueTick, SharedVariables.dbgRecTime, 1, SharedVariables.wantLoadFrameTick);
    replaySettingsForm.show(player).then(response => {
        if (response.canceled || !response.formValues) {
            return;
        }
        SharedVariables.wantLoadFrameTick = Number(response.formValues[0]);
        const entities1 = player.dimension.getEntities({
            type: "dbg:replayentity"
        });
        entities1.forEach(entity1 => {
            entity1.remove();
        });
        SharedVariables.multiPlayers.forEach((player: Player) => {
            clearStructure(player);
        });
        SharedVariables.frameLoaded = true;
        SharedVariables.multiPlayers.forEach((player: Player) => {
            loadEntity(player);
            loadBlocksUpToTick(SharedVariables.wantLoadFrameTick, player);
        });

    });
}
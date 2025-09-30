import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { cineRuntimeDataMap } from "../../data/maps";

import { deleteCinematic, loadCinematic } from "./load-delete-cinematic";
import { nameCinematic } from "./path-placement/name-cinematic";
import { namePanorama } from "./panorama/name-panorama";
//Import functions

export function cineMainMenu(player: Player) {
    const cineRuntimeData = cineRuntimeDataMap.get(player.id);
    cineRuntimeData.state = "cineMainMenu";
    const replayForm = new ActionFormData()
        .title("rc2.title.cinematic.menu")
        .body("rc2.body.main.menu")
        .button("rc2.button.create.new.cine")
        .button("rc2.button.panoramic.cinematic")
        .button("rc2.button.load.saved.paths")
        .button("rc2.button.delete.saved.paths");
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => nameCinematic(player),
            1: () => namePanorama(player),
            2: () => loadCinematic(player),
            3: () => deleteCinematic(player),
            
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

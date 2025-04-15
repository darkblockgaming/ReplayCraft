
import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../main";
import { Player } from "@minecraft/server";
import { replayCraftSkinDB } from "../../classes/subscriptions/world-initialize";

export function setSkin(player: Player) {
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.replaycraft.settings")
        .dropdown("dbg.rc1.dropdown.title.replay.skin.type", SharedVariables.skinTypes,0)
        .dropdown("dbg.rc1.dropdown.title.replay.skin.type.size",["Steve 4px","Alex 3px"],0);

    replaySettingsForm.show(player).then(response => {
        if (response.canceled && response.cancelationReason === "UserBusy") {
            setSkin(player);
        }
        
        //save the players chosen skin to the skins database.
       let dataExists = replayCraftSkinDB.set(player.id,response.formValues[0].toString()+","+response.formValues[1].toString());
       //Fix for saving issues 
       if (dataExists) {
        replayCraftSkinDB.set(player.id,response.formValues[0].toString()+","+response.formValues[1].toString());
        console.log('Data existed and was overwritten. Resaving is now complete.');
    } else {
        console.log('New data was saved.');
    }
    })
}
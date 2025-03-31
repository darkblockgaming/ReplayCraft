

import { world } from "@minecraft/server";
import { SharedVariables } from "../../../main";
import * as ui from "@minecraft/server-ui";

export function multiPlayersett(player) {
    const availablePlayers = world.getPlayers();
    if (availablePlayers.length === 1) {
        SharedVariables.multiPlayers = [];
        SharedVariables.multiPlayers.push(player);
        if (SharedVariables.textPrompt) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.no.other.players.available"
                }]
            });
        }
        player.playSound("note.bass");
        return;
    }
    const playerNames = availablePlayers.map((p, index) => `${index + 1}. ${p.name}`).join('\n'); // Add index before name

    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.multiplayer.settings")
        .toggle(`dbg.rc1.toggle.multiplayer.replay`, SharedVariables.multiToggle)
        .slider(`\nAvailable Players\n${playerNames}\n\nSelected Players`, 1, availablePlayers.length, 1, 1);

    replaySettingsForm.show(player).then(response => {
        if (response.canceled) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.please.click.submit"
                }]
            });
            player.playSound("note.bass");
            return;
        }
        if (response.formValues[1] === 1) {
            player.onScreenDisplay.setActionBar({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.you.have.to.select.multiple.players"
                }]
            });
            player.playSound("note.bass");
            return;
        }
        SharedVariables.multiToggle = response.formValues[0];
        if (SharedVariables.multiToggle === true) {
            SharedVariables.multiPlayers = [];
            const selectedNumber = response.formValues[1];
            for (let i = 0; i < selectedNumber; i++) {
                SharedVariables.multiPlayers.push(availablePlayers[i]);
            }
            player.onScreenDisplay.setActionBar(`Â§aAdded ${selectedNumber} players to multiplayer replay.`);
            player.playSound("note.pling");
        }
        if (SharedVariables.multiToggle === false) {
            SharedVariables.multiPlayers = [];
            SharedVariables.multiPlayers.push(player);
            player.onScreenDisplay.setActionBar({
                "rawtext": [{
                    "translate": "dbg.rc1.mes.multiplayer.replay.is.off"
                }]
            });
        }
    });
}
import { ModalFormData } from "@minecraft/server-ui";
import { SharedVariables } from "../main";
import { Player } from "@minecraft/server";
import { loadFromDB } from "../functions/replayControls/load-from-database";
import { replayCraftSettingsDB } from "../classes/subscriptions/world-initialize";

export function loadBuildName(player: Player) {
const entries = replayCraftSettingsDB.entries();
const playerId = player.id;

// Find and extract build names for this player
const buildNames = entries
.filter(([key, _]) => key.startsWith(playerId + "rcData"))
.map(([key, _]) => {
    const parts = key.split("rcData");
    return parts[1]; // This is the buildName
});

// Debug output (optional)
console.warn(`[DEBUG] Build names for ${player.name}:`, buildNames);

if (buildNames.length === 0) {
    player.sendMessage("No builds found for your ID.");
    return;
}

const form = new ModalFormData()
    .title("replaycraftloadbuildname.title") 
    .dropdown("Available Builds", buildNames, 0);
    form
    .show(player)
    .then((formData) => {
      
        const selectedBuild = buildNames[Number(formData.formValues[0])];
        SharedVariables.buildName = "rcData" + selectedBuild as string;
        loadFromDB(player, SharedVariables.buildName, true);

        // Do something with buildData
        player.sendMessage(`Selected build: ${selectedBuild}`);
    })
    .catch((error: Error) => {
      player.sendMessage("Failed to show form: " + error);
      return -1;
    });

}
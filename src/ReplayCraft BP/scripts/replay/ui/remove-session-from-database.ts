import { ModalFormData } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { replayCraftSettingsDB } from "../classes/subscriptions/world-initialize";
import { deleteFromDB } from "../functions/replayControls/delete-from-database";
import { debugError, debugWarn } from "../data/util/debug";

export function deleteBuildUI(player: Player) {
    const entries = replayCraftSettingsDB.entries();
    const playerId = player.id;

    // Find and extract build names for this player
    const buildNames = entries
        .filter(([key, _]) => key.startsWith(playerId + "rcData"))
        .map(([key, _]) => {
            const parts = key.split("rcData");
            return parts[1]; // This is the buildName
        });

    debugWarn(`[DEBUG] Build names for ${player.name}:`, buildNames);

    if (buildNames.length === 0) {
        player.sendMessage("No builds found for your ID.");
        return;
    }

    const form = new ModalFormData().title("replaycraftdeletebuild.title").dropdown("Available Builds", buildNames, {
        defaultValueIndex: 0,
    });
    form.show(player)
        .then((formData) => {
            const selectedBuild = buildNames[Number(formData.formValues[0])];
            let buildName = ("rcData" + selectedBuild) as string;

            deleteFromDB(player, buildName);
        })
        .catch((error: Error) => {
            debugError("Failed to show form: " + error);
            player.sendMessage({
                rawtext: [
                    {
                        translate: "replaycraft.ui.error.message",
                    },
                ],
            });

            return -1;
        });
}

import { ModalFormData } from "@minecraft/server-ui";
import { SharedVariables } from "../data/replay-player-session";
import { Player } from "@minecraft/server";
import { loadFromDB } from "../functions/replayControls/load-from-database";
import { replayCraftSettingsDB } from "../classes/subscriptions/world-initialize";
import { createPlayerSession } from "../data/create-session";

export function loadBuildName(player: Player) {
    const entries = replayCraftSettingsDB.entries();
    const playerId = player.id;

    // Find all keys starting with playerId and extract buildName suffixes
    const buildNames = entries.filter(([key, _]) => key.startsWith(playerId)).map(([key, _]) => key.slice(playerId.length));

    console.warn(`[DEBUG] Build names for ${player.name}:`, buildNames);

    if (buildNames.length === 0) {
        player.sendMessage("No builds found for your ID.");
        return;
    }

    const form = new ModalFormData().title("replaycraftloadbuildname.title").dropdown("Available Builds", buildNames, {
        defaultValueIndex: 0,
        tooltip: "Select a build to load",
    });

    form.show(player)
        .then((formData) => {
            if (!formData || !formData.formValues || formData.formValues.length === 0) {
                player.sendMessage("No build selected.");
                return;
            }

            const selectedBuild = buildNames[Number(formData.formValues[0])];

            // Get or create the player session and update the buildName
            let session = SharedVariables.playerSessions.get(playerId);
            if (!session) {
                // You probably have a createPlayerSession function:
                session = createPlayerSession(playerId);
                SharedVariables.playerSessions.set(playerId, session);
            }
            session.buildName = selectedBuild;

            // Load the build from DB; this updates the session data as needed
            loadFromDB(player, selectedBuild, true);
        })
        .catch((error: Error) => {
            console.error("Failed to show form: " + error);
            player.sendMessage({
                rawtext: [
                    {
                        translate: "replaycraft.ui.error.message",
                    },
                ],
            });
        });
}

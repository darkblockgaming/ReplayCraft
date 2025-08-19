import { ModalFormData } from "@minecraft/server-ui";
import { replaySessions } from "../data/replay-player-session";
import { doStart } from "../functions/replayControls/start-replay-recording";

import { Player } from "@minecraft/server";
import { createPlayerSession } from "../data/create-session"; // make sure to import this

export function setBuildName(player: Player) {
    const form = new ModalFormData().title("replaycraftsetbuildname.title").textField("replaycraftsetbuildname.textField", "replaycraftsetbuildname.textField2");

    form.show(player)
        .then((formData) => {
            const inputBuildName = formData.formValues[0];
            if (typeof inputBuildName !== "string" || inputBuildName.trim() === "") {
                player.sendMessage({
                    rawtext: [
                        {
                            translate: "replaycraftsetbuildname.error.message",
                        },
                    ],
                });
                player.playSound("note.bass");
                return;
            }

            const playerId = player.id;

            // Get or create player session
            let session = replaySessions.playerSessions.get(playerId);
            if (!session) {
                session = createPlayerSession(playerId);
                replaySessions.playerSessions.set(playerId, session);
            }

            // Update the session's buildName
            session.buildName = "rcData" + inputBuildName.trim();

            // Start replay using the updated session buildName
            doStart(player);
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
            return -1;
        });
}

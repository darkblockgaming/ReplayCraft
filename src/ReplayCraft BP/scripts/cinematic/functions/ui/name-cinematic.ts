import { ModalFormData } from "@minecraft/server-ui";
import { Player, world } from "@minecraft/server";

export function nameCinematic(player: Player) {
    const form = new ModalFormData().title("create new cinematic path").textField("name this cinematic path", "replaycraftsetbuildname.textField2");

    form.show(player)
        .then((formData) => {
            const inputBuildName = formData.formValues[0];
            if (typeof inputBuildName !== "string" || inputBuildName.trim() === "") {
                player.sendMessage({
                    rawtext: [
                        {
                            translate: "type a valid name for the new cinematic path",
                        },
                    ],
                });
                player.playSound("note.bass");
                return;
            }

            world.sendMessage(`${inputBuildName.trim()}`);

            // Update the session's buildName
            //session.buildName = "rcData" + inputBuildName.trim();

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

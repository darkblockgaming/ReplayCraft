import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { addCameraPoint } from "../../functions/camera/add-camera-point";

export function isInstantCameraPoint(player: Player) {
    const form = new ModalFormData().title("Instant Camera Point").toggle("Make this camera point instant?", { defaultValue: false });

    form.show(player).then((response) => {
        if (response.canceled) return;

        const isInstant = Boolean(response.formValues[0]);
        addCameraPoint(player, isInstant);
    });
}

import * as ui from "@minecraft/server-ui";
import { SharedVariables } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";
import { replayCraftSkinDB } from "../../classes/subscriptions/world-initialize";

export function setSkin(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    let skinData = replayCraftSkinDB.get(player.id);
    const [skinIDStr, modelIDStr] = skinData.split(",");
    const skinID: number = parseInt(skinIDStr);
    const modelID: number = parseInt(modelIDStr);

    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.replaycraft.settings")
        .dropdown("dbg.rc1.dropdown.title.replay.skin.type", session.skinTypes, { defaultValueIndex: skinID })
        .dropdown("dbg.rc1.dropdown.title.replay.skin.type.size", ["Steve 4px", "Alex 3px"], { defaultValueIndex: modelID });

    replaySettingsForm
        .show(player)
        .then((response) => {
            if (response.canceled && response.cancelationReason === "UserBusy") {
                setSkin(player);
                return;
            }

            if (!response.formValues || response.formValues[0] === undefined || response.formValues[1] === undefined) {
                console.warn("setSkin: formValues missing or incomplete");
                return;
            }

            const skinType = response.formValues[0].toString();
            const skinSize = response.formValues[1].toString();
            replayCraftSkinDB.set(player.id, `${skinType},${skinSize}`);
        })
        .catch((err) => {
            console.error("setSkin error:", err);
        });
}

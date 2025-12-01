import * as ui from "@minecraft/server-ui";
import { replaySessions } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";
import { replayCraftSkinDB } from "../../classes/subscriptions/world-initialize";
import { debugError, debugWarn } from "../../data/util/debug";

export function setSkin(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }

    let skinID: number = 0;
    let modelID: number = 0;
    let capeID: number = 0;
    let skinData = replayCraftSkinDB.get(player.id);
    if (skinData) {
        const [skinIDStr, modelIDStr, capeIDStr] = skinData.split(",");
        skinID = parseInt(skinIDStr);
        modelID = parseInt(modelIDStr);
        capeID = parseInt(capeIDStr);
    }
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.replaycraft.settings")
        .dropdown("dbg.rc1.dropdown.title.replay.skin.type", session.skinTypes, { defaultValueIndex: skinID })
        .dropdown("dbg.rc1.dropdown.title.replay.skin.type.size", ["Steve 4px", "Alex 3px"], { defaultValueIndex: modelID })
        .dropdown("dbg.rc1.dropdown.title.replay.skin.cape", session.capeTypes, { defaultValueIndex: capeID });

    replaySettingsForm
        .show(player)
        .then((response) => {
            if (response.canceled && response.cancelationReason === "UserBusy") {
                setSkin(player);
                return;
            }

            if (!response.formValues || response.formValues[0] === undefined || response.formValues[1] === undefined || response.formValues[2] === undefined) {
                debugWarn("setSkin: formValues missing or incomplete");
                return;
            }

            const skinType = response.formValues[0].toString();
            const skinSize = response.formValues[1].toString();
            const capeType = response.formValues[2].toString();
            replayCraftSkinDB.set(player.id, `${skinType},${skinSize}, ${capeType}`);
        })
        .catch((err) => {
            debugError("setSkin error:", err);
        });
}

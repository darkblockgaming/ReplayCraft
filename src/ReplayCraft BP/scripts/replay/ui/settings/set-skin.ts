import * as ui from "@minecraft/server-ui";
import { replaySessions } from "../../data/replay-player-session";
import { Player } from "@minecraft/server";
import { replayCraftSkinDB } from "../../classes/subscriptions/world-initialize";
import { debugError, debugLog, debugWarn } from "../../data/util/debug";
import { createPlayerSession } from "../../data/create-session";
import { initializePlayerMaps } from "../../data/initialize-player-maps";
import config from "../../data/util/config";

export function setSkin(player: Player) {
    let tempSession = false;
    let session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        //player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        session = createPlayerSession(player.id);
        initializePlayerMaps(session, player.id);
        session.playerName = player.name;
        replaySessions.playerSessions.set(player.id, session);

        if (config.debugPlayerItemUseAfterEvent === true) {
            debugLog(`[Replay Init] Session created for ${player.name}`);
        }
        tempSession = true;
    }

    let skinID: number = 0;
    let modelID: number = 0;
    let capeID: number = 0;

    const skinData = replayCraftSkinDB.get(player.id);

    if (skinData) {
        const parts = skinData.split(",");
        // verify if we have all parts and parse them
        skinID = parseInt(parts[0] ?? "0") || 0;
        modelID = parseInt(parts[1] ?? "0") || 0;
        capeID = parseInt(parts[2] ?? "0") || 0;
    }

    const replaySettingsForm = new ui.ModalFormData()
        .title("rc1.title.rc1.settings")
        .dropdown("rc1.dropdown.title.replay.skin.type", session.skinTypes, { defaultValueIndex: skinID })
        .dropdown("rc1.dropdown.title.replay.skin.type.size", ["Steve 4px", "Alex 3px"], { defaultValueIndex: modelID })
        .dropdown("rc1.dropdown.title.replay.skin.cape", session.capeTypes, { defaultValueIndex: capeID });

    replaySettingsForm
        .show(player)
        .then((response) => {
            if (response.canceled && response.cancelationReason === "UserBusy") {
                if (tempSession) {
                    replaySessions.playerSessions.delete(player.id);
                }
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
            if (tempSession) {
                replaySessions.playerSessions.delete(player.id);
            }
        })
        .catch((err) => {
            debugError("setSkin error:", err);
        });
}

import { Player } from "@minecraft/server";
import { replayCraftBeforeBlockInteractionsDB, replayCraftBlockDB, replayCraftBlockInteractionsDB, replayCraftPlaybackEntityDB, replayCraftPlayerActionsDB, replayCraftPlayerArmorWeaponsDB, replayCraftPlayerPosDB, replayCraftPlayerRotDB, replayCraftSettingsDB } from "../../classes/subscriptions/world-initialize";

export function deleteFromDB(player: Player, buildName: string) {
    replayCraftBlockDB.delete(player.id + buildName);
    replayCraftBeforeBlockInteractionsDB.delete(player.id + buildName);
    replayCraftBlockInteractionsDB.delete(player.id + buildName);
    replayCraftPlaybackEntityDB.delete(player.id + buildName);
    replayCraftPlayerActionsDB.delete(player.id + buildName);
    replayCraftPlayerArmorWeaponsDB.delete(player.id + buildName);
    replayCraftPlayerPosDB.delete(player.id + buildName);
    replayCraftPlayerRotDB.delete(player.id + buildName);
    replayCraftSettingsDB.delete(player.id + buildName);
}
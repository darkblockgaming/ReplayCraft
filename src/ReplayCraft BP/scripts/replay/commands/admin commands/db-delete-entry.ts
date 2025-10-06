import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import {
    replayCraftBlockDB,
    replayCraftPlayerPosDB,
    replayCraftPlayerRotDB,
    replayCraftPlayerActionsDB,
    replayCraftSettingsDB,
    replayCraftBlockInteractionsDB,
    replayCraftBeforeBlockInteractionsDB,
    replayCraftPlaybackEntityDB,
    replayCraftPlayerArmorWeaponsDB,
    replayCraftSkinDB,
    replayCraftActiveSessionsDB,
    replayCraftAmbientEntityDB,
    replayCraftAllRecordedPlayerIdsDB,
    replayCraftTrackedPlayerJoinTicksDB,
    replayCraftPlayerDamageEventsDB,
    replayCraftPlayerItemUseEventsDB,
} from "../../classes/subscriptions/world-initialize";
import { OptimizedDatabase } from "../../data/data-hive";
export function dbDeleteCmd(_origin: CustomCommandOrigin, targetDatabase: string, value: string) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    let db: OptimizedDatabase;

    system.run(() => {
        switch (targetDatabase) {
            case "replayCraftAmbientEntityDB":
                db = replayCraftAmbientEntityDB;
                break;
            case "replayCraftAllRecordedPlayerIds":
                db = replayCraftAllRecordedPlayerIdsDB;
                break;
            case "replayCraftBlockDB":
                db = replayCraftBlockDB;
                break;
            case "replayCraftPlayerPosDB":
                db = replayCraftPlayerPosDB;
                break;
            case "replayCraftPlayerRotDB":
                db = replayCraftPlayerRotDB;
                break;
            case "replayCraftPlayerActionsDB":
                db = replayCraftPlayerActionsDB;
                break;
            case "replayCraftSettingsDB":
                db = replayCraftSettingsDB;
                break;
            case "replayCraftBlockInteractionsDB":
                db = replayCraftBlockInteractionsDB;
                break;
            case "replayCraftBeforeBlockInteractionsDB":
                db = replayCraftBeforeBlockInteractionsDB;
                break;
            case "replayCraftPlaybackEntityDB":
                db = replayCraftPlaybackEntityDB;
                break;

            case "replayCraftPlayerArmorWeaponsDB":
                db = replayCraftPlayerArmorWeaponsDB;
                break;
            case "replayCraftSkinDB":
                db = replayCraftSkinDB;
                break;

            case "replayCraftActiveSessionsDB":
                db = replayCraftActiveSessionsDB;
                break;
            case "replayTrackedPlayerJoinTicksDB":
                db = replayCraftTrackedPlayerJoinTicksDB;
                break;
            case "replayCraftPlayerDamageEventsDB":
                db = replayCraftPlayerDamageEventsDB;
                break;
            case "replayCraftPlayerItemUseEventsDB":
                db = replayCraftPlayerItemUseEventsDB;
                break;
        }
        if (!db) {
            sender.sendMessage(`Database ${targetDatabase} not found.`);
            return;
        }
        db.delete(value);
        sender.sendMessage(`Deleted entry with key ${value} from ${targetDatabase}.`);
        return;
    });

    return {
        status: CustomCommandStatus.Success,
        message: ``,
    };
}

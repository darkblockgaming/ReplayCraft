import { CustomCommandOrigin, CustomCommandStatus, system } from "@minecraft/server";
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
} from "../../classes/subscriptions/world-initialize";
import { OptimizedDatabase } from "../../data/data-hive";

export function debugDatabaseConsoleCmd(_origin: CustomCommandOrigin, targetDatabase: string) {
    let db: OptimizedDatabase;
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
    }
    system.run(() => {
        for (const [key, value] of db.entries()) {
            console.log(`[${key}]`, JSON.stringify(value, null, 2));
        }
    });
    return {
        status: CustomCommandStatus.Success,
        message: `Check the server console.`,
    };
}

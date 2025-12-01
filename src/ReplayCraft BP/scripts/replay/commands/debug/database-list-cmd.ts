import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { OptimizedDatabase } from "../../data/data-hive";
import { fetchDatabase } from "../../functions/database/fetch-database";
import { debugLog } from "../../data/util/debug";

export function debugDatabaseConsoleCmd(_origin: CustomCommandOrigin, targetDatabase: string) {
    let db: OptimizedDatabase;
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    try {
        db = fetchDatabase(targetDatabase);
    } catch (err) {
        sender.sendMessage(`§4[ReplayCraft]§cDatabase "${targetDatabase}" not found or invalid.`);
        return {
            status: CustomCommandStatus.Failure,
            message: `Database "${targetDatabase}" not found or invalid.`,
        };
    }

    system.run(() => {
        for (const [key, value] of db.entries()) {
            debugLog(`[${key}]`, JSON.stringify(value, null, 2));
        }
    });
    return {
        status: CustomCommandStatus.Success,
        message: `Check the server console.`,
    };
}

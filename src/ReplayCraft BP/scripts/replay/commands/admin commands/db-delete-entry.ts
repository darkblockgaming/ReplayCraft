import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { fetchDatabase } from "../../functions/database/fetch-database";
import { OptimizedDatabase } from "../../data/data-hive";

export function dbDeleteCmd(_origin: CustomCommandOrigin, targetDatabase: string, value: string) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;

    system.run(() => {
        let db: OptimizedDatabase;

        try {
            db = fetchDatabase(targetDatabase);
        } catch (err) {
            sender.sendMessage(`§4[ReplayCraft]§cDatabase "${targetDatabase}" not found or invalid.`);
            return;
        }

        db.delete(value);
        sender.sendMessage(`§4[ReplayCraft]§aDeleted entry with key "${value}" from ${targetDatabase}.`);
    });

    return {
        status: CustomCommandStatus.Success,
        message: "",
    };
}

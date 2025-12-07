import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { dbClearAllAsync } from "../../functions/database/wipe-database-async";

export function dbClearAllCmd(_origin: CustomCommandOrigin) {
    const sender = _origin.sourceEntity as Player;

    if (!sender) {
        return {
            status: CustomCommandStatus.Failure,
            message: "Command must be run by a player.",
        };
    }

    // Call the async helper without awaiting
    system.run(() => {
        dbClearAllAsync(sender).catch((err) => {
            sender.sendMessage(`§cError during database wipe: ${err}`);
        });
    });
    // Immediately return a valid command result
    return {
        status: CustomCommandStatus.Success,
        message: "Confirmation pending...",
    };
}

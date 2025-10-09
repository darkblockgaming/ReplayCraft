import { system, Player } from "@minecraft/server";
import { fetchDatabase, getAllDatabaseIds } from "../../functions/database/fetch-database";
import { captchaUI } from "../../ui/captcha";

export async function dbClearAllAsync(sender: Player) {
    const captchaText = Math.random().toString(36).substring(2, 8).toUpperCase(); // e.g., "W8JHS"
    const result = await captchaUI(sender, captchaText);

    if (result !== 1) {
        sender.sendMessage("§cAction cancelled. No data was deleted.");
        return;
    }

    sender.sendMessage("§6Clearing all databases... Please wait.");

    system.run(() => {
        const databaseIds = getAllDatabaseIds();

        for (const id of databaseIds) {
            try {
                const db = fetchDatabase(id);
                db.clear();
            } catch (err) {
                sender.sendMessage(`§cFailed to clear ${id}: ${err}`);
            }
        }

        sender.sendMessage("§aAll databases have been wiped successfully!");
    });
}

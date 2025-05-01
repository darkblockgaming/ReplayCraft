import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { OptimizedDatabase } from "../../data/data-hive";
import { replayCraftBeforeBlockInteractionsDB, replayCraftBlockDB, replayCraftBlockInteractionsDB, replayCraftPlaybackEntityDB, replayCraftPlayerActionsDB, replayCraftPlayerArmorWeaponsDB, replayCraftPlayerPosDB, replayCraftPlayerRotDB, replayCraftSettingsDB, replayCraftSkinDB } from "../../classes/subscriptions/world-initialize";
import { Player } from "@minecraft/server";

 

export function showDatabaseListUI(player: Player) {
    const allDatabases: [string, OptimizedDatabase][] = [
        ["Block Data", replayCraftBlockDB],
        ["Player Position", replayCraftPlayerPosDB],
        ["Player Rotation", replayCraftPlayerRotDB],
        ["Player Actions", replayCraftPlayerActionsDB],
        ["Block Interactions", replayCraftBlockInteractionsDB],
        ["Before Block Interactions", replayCraftBeforeBlockInteractionsDB],
        ["Playback Entities", replayCraftPlaybackEntityDB],
        ["Armor & Weapons", replayCraftPlayerArmorWeaponsDB],
        ["Player Skins", replayCraftSkinDB],
        ["Settings", replayCraftSettingsDB]
    ];
    const form = new ActionFormData()
        .title("📁 ReplayCraft DB Overview")
        .body("Select a database to view entry sizes:");

    for (const [label, db] of allDatabases) {
        const size = db ? db.getTotalSizeMB() : "N/A";
        form.button(`${label}\n§7${size} MB`);
    }

    form.show(player).then(result => {
        if (result.canceled && result.cancelationReason === "UserBusy") {
           showDatabaseListUI(player);
            return;
        }

        const selectedDB = allDatabases[result.selection][1];
        showDatabaseEntryUI(player, selectedDB);
    });

    function showDatabaseEntryUI(player: Player, db: OptimizedDatabase) {
        const sizes = db.getEntrySizesMB();
        const totalSize = db.getTotalSizeMB();
    
        const body = [
            `§l§e[${db.name}] Entries:§r`,
            "",
            ...sizes.map(([key, size]) => `§6${key}§r: §b${size} MB`),
            "",
            `§7Total size: §a${totalSize} MB`
        ].join("\n");
    
        new MessageFormData()
            .title(`📦 ${db.name}`)
            .body(body)
            .button1("Back")
            .button2("Clean Up")
            .show(player)
            .then(result => {
                if (result.selection === 1) {
                    db.clean();
                    player.sendMessage(`§aCleaned up invalid entries in §6${db.name}§a.`);
                } else if (result.selection === 0) {
                    showDatabaseListUI(player);
                }
            });
    }
    
}

import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { OptimizedDatabase } from "../../data/data-hive";
import {
    replayCraftBeforeBlockInteractionsDB,
    replayCraftBlockDB,
    replayCraftBlockInteractionsDB,
    replayCraftPlaybackEntityDB,
    replayCraftPlayerActionsDB,
    replayCraftPlayerArmorWeaponsDB,
    replayCraftPlayerPosDB,
    replayCraftPlayerRotDB,
    replayCraftSettingsDB,
    replayCraftSkinDB,
    replayAmbientEntityDB,
} from "../../classes/subscriptions/world-initialize";
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
        ["Settings", replayCraftSettingsDB],
        ["Ambient Entity's", replayAmbientEntityDB],
    ];

    const form = new ActionFormData().title("ReplayCraft DB Overview").body("Select a database to view entry sizes:");

    for (const [label, db] of allDatabases) {
        const size = db ? db.getTotalSizeMB() : "N/A";
        form.button(`${label}\n§7${size} MB`);
    }

    form.show(player).then((result) => {
        if (result.canceled && result.cancelationReason === "UserBusy") {
            showDatabaseListUI(player);
            return;
        }

        if (result.selection === undefined) return;

        const selectedDB = allDatabases[result.selection][1];
        showDatabaseEntryUI(player, selectedDB);
    });
}

function showDatabaseEntryUI(player: Player, db: OptimizedDatabase) {
    const sizes = db.getEntrySizesMB();
    const totalSize = db.getTotalSizeMB();

    const body = [`§l§e[${db.name}] Entries:§r`, "", ...sizes.map(([key, size]) => `§6${key}§r: §b${size} MB`), "", `§7Total size: §a${totalSize} MB`].join("\n");

    new MessageFormData()
        .title(`${db.name}`)
        .body(body)
        .button1("Back")
        .button2("Explore Data")
        .show(player)
        .then((result) => {
            if (result.selection === 1) {
                showEntryKeysUI(player, db);
            } else {
                showDatabaseListUI(player);
            }
        });
}

function showEntryKeysUI(player: Player, db: OptimizedDatabase) {
    const keys = db.getEntryKeys();
    const form = new ActionFormData().title(`Entries in ${db.name}`).body(`Select an entry to view full data:`);

    for (const key of keys.slice(0, 25)) {
        form.button(key);
    }

    form.show(player).then((result) => {
        if (result.canceled || result.selection === undefined) return;
        const selectedKey = keys[result.selection];
        if (!selectedKey) return;
        showEntryDataUI(player, db, selectedKey);
    });
}

function showEntryDataUI(player: Player, db: OptimizedDatabase, key: string) {
    const data = db.getData(key);
    const jsonData = JSON.stringify(data, null, 2);

    const pageLimit = 800;
    const pageCount = Math.ceil(jsonData.length / pageLimit);
    let currentPage = 0;

    function showPage(page: number) {
        const start = page * pageLimit;
        const end = start + pageLimit;
        const body = jsonData.slice(start, end);

        new MessageFormData()
            .title(`${key} (Page ${page + 1}/${pageCount})`)
            .body(body)
            .button1("Back")
            .button2(page + 1 < pageCount ? "Next" : "Close")
            .show(player)
            .then((result) => {
                if (result.selection === 0) {
                    showEntryKeysUI(player, db);
                } else if (result.selection === 1 && page + 1 < pageCount) {
                    showPage(page + 1);
                }
            });
    }

    showPage(currentPage);
}

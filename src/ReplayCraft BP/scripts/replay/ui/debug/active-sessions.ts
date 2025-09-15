import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { replayCraftActiveSessionsDB } from "../../classes/subscriptions/world-initialize";

export function showActiveSessionsUI(player: Player, playerLabels: string[], playerIds: string[]) {
    if (playerLabels.length === 0) {
        const form = new ModalFormData().title("Active Replay Sessions").dropdown("Select a player", ["No active sessions"]);

        form.show(player).then(() => {
            player.sendMessage("§cThere are no active replay sessions right now.");
        });
        return;
    }

    const form = new ModalFormData().title("Active Replay Sessions").dropdown("Select a player", playerLabels);

    form.show(player).then((response) => {
        if (response.canceled && response.cancelationReason === "UserBusy") {
            showActiveSessionsUI(player, playerLabels, playerIds);
            return;
        }

        const selectedIndex = response.formValues?.[0] as number;
        const selectedPlayerId = playerIds[selectedIndex];
        const selectedSession = replaySessions.playerSessions.get(selectedPlayerId);

        if (!selectedSession) {
            player.sendMessage(`§cNo session found for ${selectedPlayerId}`);
            return;
        }

        showSessionExplorerUI(player, selectedSession, selectedPlayerId);
    });
}

export function showSessionExplorerUI(player: Player, session: any, sessionId: string) {
    const keys = Object.keys(session);
    const pageLimit = 25; // number of keys per page
    const totalPages = Math.ceil(keys.length / pageLimit);
    let currentPage = 0;

    function showPage(page: number) {
        const start = page * pageLimit;
        const end = start + pageLimit;
        const pageKeys = keys.slice(start, end);

        const form = new ActionFormData().title(`Session: ${sessionId} (Page ${page + 1}/${totalPages})`).body("Select a key to view its value:");

        for (const key of pageKeys) {
            let label = key;

            const value = session[key];
            if (value instanceof Map) {
                const bytes = estimateMapMemory(value);
                label += ` §7(${formatBytes(bytes)})`;
            }

            form.button(label);
        }

        // Navigation buttons
        if (totalPages > 1) {
            if (page > 0) form.button("⬅ Previous Page");
            if (page + 1 < totalPages) form.button("Next Page ➡");
        }

        // Delete session button always last
        form.button("§cDelete Session");

        form.show(player).then((result) => {
            if (result.canceled || result.selection === undefined) return;

            const selection = result.selection;

            // Navigate pages
            if (totalPages > 1) {
                if (page > 0 && selection === pageKeys.length) {
                    showPage(page - 1);
                    return;
                }
                if (page + 1 < totalPages && selection === pageKeys.length + (page > 0 ? 1 : 0)) {
                    showPage(page + 1);
                    return;
                }
            }

            // Delete session
            if (selection === pageKeys.length + (totalPages > 1 ? (page > 0 ? 2 : 1) : 0)) {
                confirmDeleteSession(player, sessionId);
                return;
            }

            // Show selected key value
            const selectedKey = pageKeys[selection];
            showSessionKeyValueUI(player, session, selectedKey, sessionId);
        });
    }

    showPage(currentPage);
}

function showSessionKeyValueUI(player: Player, session: any, key: string, sessionId: string) {
    const value = session[key];
    const json = safeStringify(value, 2);

    const pageLimit = 800;
    const pageCount = Math.ceil(json.length / pageLimit);
    let currentPage = 0;

    function showPage(page: number) {
        const start = page * pageLimit;
        const end = start + pageLimit;
        const chunk = json.slice(start, end);

        new MessageFormData()
            .title(`${sessionId} → ${key} (Page ${page + 1}/${pageCount})`)
            .body(chunk)
            .button1("Back")
            .button2(page + 1 < pageCount ? "Next" : "Close")
            .show(player)
            .then((result) => {
                if (result.selection === 0) {
                    showSessionExplorerUI(player, session, sessionId);
                } else if (result.selection === 1 && page + 1 < pageCount) {
                    showPage(page + 1);
                }
            });
    }

    showPage(currentPage);
}
/*
 * Safely stringify an object, handling circular references and special types like Map and Set.
 * @param obj The object to stringify.
 * @param space Optional number of spaces for indentation in the output JSON string.
 * @returns A JSON string representation of the object, with circular references handled.
 */
function safeStringify(obj: any, space = 2): string {
    const seen = new WeakSet();
    return JSON.stringify(
        obj,
        function (_key, value) {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) return "[Circular]";
                seen.add(value);

                // Convert Maps to objects for visibility
                if (value instanceof Map) {
                    return Object.fromEntries(value);
                }

                // Convert Sets to arrays
                if (value instanceof Set) {
                    return Array.from(value);
                }
            }
            return value;
        },
        space
    );
}

function confirmDeleteSession(player: Player, sessionId: string) {
    new MessageFormData()
        .title("Confirm Deletion")
        .body(`Are you sure you want to delete the session for "${sessionId}"?`)
        .button1("§cYes, delete")
        .button2("Cancel")
        .show(player)
        .then((result) => {
            if (result.selection === 0) {
                replaySessions.playerSessions.delete(sessionId);
                replayCraftActiveSessionsDB.delete(player.id);

                player.sendMessage(`§aDeleted session for ${sessionId}.`);
            } else {
                player.sendMessage("§7Session deletion cancelled.");
            }
        });
}

function estimateMapMemory(map: Map<any, any>, sampleSize = 50): number {
    const totalEntries = map.size;
    if (totalEntries === 0) return 0;

    let totalSampled = 0;
    let count = 0;

    for (const value of map.values()) {
        const str = JSON.stringify(value) ?? "";
        totalSampled += str.length;
        count++;
        if (count >= sampleSize) break; // sample first N entries
    }

    if (count === 0) return 0;

    const avgSize = totalSampled / count;
    return Math.round(avgSize * totalEntries); // approximate total bytes
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

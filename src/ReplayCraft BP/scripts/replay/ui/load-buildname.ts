import { ActionFormData } from "@minecraft/server-ui";
import { replaySessions } from "../data/replay-player-session";
import { Player, system } from "@minecraft/server";
import { loadFromDB } from "../functions/replayControls/load-from-database";
import { replayCraftSettingsDB } from "../classes/subscriptions/world-initialize";
import { createPlayerSession } from "../data/create-session";
import { BuildOption, ReplayDataV3 } from "../classes/types/types";
import { debugError } from "../data/util/debug";

const PAGE_SIZE = 7;

export function loadBuildName(player: Player, page = 0): void {
    const entries = replayCraftSettingsDB.entries();
    const playerId = player.id;

    const buildOptions: BuildOption[] = (entries as [string, string | ReplayDataV3][])
        .filter(([key, _]) => key.startsWith(playerId + "rcData"))
        .map(([key, value]) => {
            const buildName = key.split("rcData")[1];
            let parsedValue: ReplayDataV3 | null = null;

            if (typeof value === "string") {
                try {
                    parsedValue = JSON.parse(value);
                } catch {
                    parsedValue = null;
                }
            } else if (typeof value === "object" && value !== null) {
                parsedValue = value;
            }

            const isValid = parsedValue !== null && "playerName" in parsedValue && "recordingEndTick" in parsedValue;

            return {
                name: buildName,
                display: isValid ? buildName : `§c${buildName} (Incompatible)`,
                isValid,
            };
        });
    buildOptions.reverse();

    if (buildOptions.length === 0) {
        player.sendMessage("No builds found for your ID.");
        return;
    }

    const totalPages = Math.ceil(buildOptions.length / PAGE_SIZE);
    page = Math.min(Math.max(page, 0), totalPages - 1);

    const pageOptions = buildOptions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const form = new ActionFormData().title("Select a Build to Load");

    pageOptions.forEach((opt) => {
        form.button(opt.display);
    });

    const navButtons: string[] = [];
    if (page > 0) navButtons.push("Back");
    if (page < totalPages - 1) navButtons.push("Next");

    navButtons.forEach((btn) => form.button(btn));

    form.show(player)
        .then((result) => {
            if (result.canceled) {
                player.sendMessage("Build selection canceled.");
                return;
            }

            const selection = result.selection;
            if (selection === undefined) return;

            if (selection >= pageOptions.length) {
                const navIndex = selection - pageOptions.length;
                const isBack = page > 0 && navButtons[navIndex] === "Back";
                const isNext = page < totalPages - 1 && navButtons[navIndex] === "Next";

                if (isBack) {
                    system.run(() => loadBuildName(player, page - 1));
                } else if (isNext) {
                    system.run(() => loadBuildName(player, page + 1));
                }
                return;
            }

            const selectedOption = pageOptions[selection];
            if (!selectedOption.isValid) {
                player.sendMessage("§cThis build is incompatible with the current version of ReplayCraft.");
                system.run(() => loadBuildName(player, page)); // reload current page
                return;
            }

            const selectedBuild = selectedOption.name;
            let session = replaySessions.playerSessions.get(playerId);
            if (!session) {
                session = createPlayerSession(playerId);
                replaySessions.playerSessions.set(playerId, session);
            }

            const fullBuildName = "rcData" + selectedBuild;
            session.buildName = fullBuildName;

            loadFromDB(player, fullBuildName, true);
        })
        .catch((error) => {
            debugError("Failed to show form:", error);
            player.sendMessage({
                rawtext: [{ translate: "replaycraft.ui.error.message" }],
            });
        });
}

import { ActionFormData } from "@minecraft/server-ui";
import { Player, system } from "@minecraft/server";
import { debugError, debugWarn } from "../data/util/debug";
import { BuildOption } from "../classes/types/types";
import { HttpRequest, HttpRequestMethod, HttpHeader, http } from "@minecraft/server-net";
import { loadFromExternalServerWithUI } from "../functions/replayControls/load-from-database";
import config from "../data/util/config";

const PAGE_SIZE = 7;
const BACKEND_URL = config.backendURL;

export async function selectBuildFromExternalServer(player: Player, page = 0): Promise<void> {
    try {
        // Fetch build list from backend for this specific player
        const req = new HttpRequest(`${BACKEND_URL}/replays?playerId=${player.id}`);
        req.method = HttpRequestMethod.Get;
        req.headers = [new HttpHeader("Accept", "application/json")];

        const res = await http.request(req);
        if (res.status !== 200) {
            debugWarn(`Failed to fetch builds from backend. Status: ${res.status}`);
            player.sendMessage("§cFailed to retrieve builds from server.");
            return;
        }

        const data = JSON.parse(res.body) as { replays: string[] };
        if (!Array.isArray(data.replays) || data.replays.length === 0) {
            player.sendMessage("§cNo builds found on the server.");
            return;
        }

        // Strip player ID prefix and rc prefix for display
        const buildOptions: BuildOption[] = data.replays.map((filename) => {
            // filename format: "-17179869183_rcDatatest"
            const nameWithoutPrefix = filename.replace(/^.*?_rc/, ""); // removes everything up to "_rc"
            return {
                name: filename, // keep full name for loading
                display: nameWithoutPrefix, // show without player ID or rc
                isValid: true,
            };
        });

        const totalPages = Math.ceil(buildOptions.length / PAGE_SIZE);
        page = Math.min(Math.max(page, 0), totalPages - 1);
        const pageOptions = buildOptions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

        const form = new ActionFormData().title("Select a Build to Load");
        pageOptions.forEach((opt) => form.button(opt.display));

        // Navigation buttons
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

                // Handle page navigation
                if (selection >= pageOptions.length) {
                    const navIndex = selection - pageOptions.length;
                    if (page > 0 && navButtons[navIndex] === "Back") system.run(() => selectBuildFromExternalServer(player, page - 1));
                    else if (page < totalPages - 1 && navButtons[navIndex] === "Next") system.run(() => selectBuildFromExternalServer(player, page + 1));
                    return;
                }

                // Selected build — use full filename with playerId to load
                const selectedBuild = pageOptions[selection].name;
                loadFromExternalServerWithUI(player, selectedBuild, BACKEND_URL, true);
            })
            .catch((error) => {
                debugError("Failed to show form:", error);
                player.sendMessage({ rawtext: [{ translate: "rc1.ui.error.message" }] });
            });
    } catch (err) {
        debugError("Error fetching build list from backend:", err);
        player.sendMessage("§cFailed to fetch build list from server.");
    }
}

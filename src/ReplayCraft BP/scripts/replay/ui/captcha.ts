import { Player } from "@minecraft/server";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { debugLog } from "../data/util/debug";
//import { debugLog } from "../data/util/debug";

/**
 * Displays a confirmation UI with a captcha phrase.
 * Returns:
 *  - 1 if passed
 *  - 0 if failed
 *  - -1 if cancelled / empty input / closed UI
 *  - -2 if form failed to open
 */
export async function captchaUI(player: Player, captchaText: string): Promise<number> {
    const messageForm = new ModalFormData().title("Confirm Action").label(`Type the following phrase to confirm:\n\n§e${captchaText}`).textField("Confirmation:", "");

    try {
        const formData: ModalFormResponse = await messageForm.show(player);

        // DEBUG: log the full response
        debugLog(`[DEBUG] formData for ${player.name}:`, JSON.stringify(formData, null, 2));

        // Retry automatically if the player has another UI open
        if (formData.canceled && formData.cancelationReason === "UserBusy") {
            debugLog(`[DEBUG] ${player.name} is busy, retrying captcha UI...`);
            return captchaUI(player, captchaText);
        }

        // Safely extract the first string value from formValues
        const formValues = formData.formValues ?? [];
        debugLog(`[DEBUG] formValues for ${player.name}:`, JSON.stringify(formValues, null, 2));

        const rawValue = formValues.find((v) => typeof v === "string") ?? "";
        debugLog(`[DEBUG] rawValue for ${player.name}:`, rawValue);

        const userInput = rawValue.trim();

        // Player closed UI or typed nothing
        if (userInput === "") {
            debugLog(`[DEBUG] Captcha cancelled by ${player.name}`);
            return -1;
        }

        // Correct captcha
        if (userInput === captchaText) {
            debugLog(`[DEBUG] Captcha passed by ${player.name}`);
            return 1;
        }

        // Incorrect input
        debugLog(`[DEBUG] Captcha failed by ${player.name} (entered: "${userInput}")`);
        return 0;
    } catch (error) {
        debugLog(`[DEBUG] Failed to show captcha UI for ${player.name}:`, error);
        return -2;
    }
}

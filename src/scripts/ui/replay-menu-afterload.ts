import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { replaySessions } from "../data/replay-player-session";
import { Player } from "@minecraft/server";
import { loadBlocksUpToTick } from "../functions/loadBlocksUpToTick";
import { clearStructure } from "../functions/clearStructure";
import { removeEntities } from "../functions/removeEntities";

export function replayMenuAfterLoad(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    const form = new ActionFormData().title("replaymenueafterload.title").button("replaymenueafterload.button1").button("replaymenueafterload.button2").button("replaymenueafterload.button3");
    form.show(player)
        .then(async (response: ActionFormResponse) => {
            if (response.selection === 0) {
                session.replayStateMachine.setState("recPaused");
                await loadBlocksUpToTick(session.recordingEndTick, player);
                // Wait for `clearStructure()` to finish before proceeding
                await clearStructure(player);

                // Then remove entities
                removeEntities(player, false);

                // Now safely load blocks
                await loadBlocksUpToTick(session.recordingEndTick, player);
                player.sendMessage("§f§4[ReplayCraft]§f Replay recording has been set to a paused state you will need to resume it.");
                return;
            }
            if (response.selection === 1) {
                session.replayStateMachine.setState("recSaved");
                player.sendMessage("§f§4[ReplayCraft]§f Replay has been loaded please open the menu.");
                return;
            }
            if (response.selection === 2) {
                session.replayStateMachine.setState("recCamSetup");
                player.sendMessage("§f§4[ReplayCraft]§f Replay has been loaded please open the menu.");
                return;
            }
        })
        .catch((error: Error) => {
            player.sendMessage("Failed to show form: " + error);
            return -1;
        });
}

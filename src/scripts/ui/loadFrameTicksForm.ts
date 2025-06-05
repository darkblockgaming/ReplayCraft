import { replaySessions } from "../data/replay-player-session";
import * as ui from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { clearStructure } from "../functions/clearStructure";
import { loadEntity } from "../functions/loadEntity";
import { loadBlocksUpToTick } from "../functions/loadBlocksUpToTick";
import { removeEntities } from "../functions/removeEntities";

export function loadFrameTicksForm(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    const currentTick = session.targetFrameTick;
    const maxTick = session.recordingEndTick;

    // Determine last camera point tick or fallback to 0
    const lastCamTick = session.replayCamPos.length > 0 ? Math.max(...session.replayCamPos.map((c) => c.tick)) : 0;

    // Slider min is last camera point tick, max is full recording length
    const sliderMin = lastCamTick;
    const sliderMax = maxTick;

    // Clamp currentTick between sliderMin and sliderMax
    const defaultSlider = Math.max(sliderMin, Math.min(currentTick, sliderMax));

    const replaySettingsForm = new ui.ModalFormData()
        .title("Load Frames - Ticks")
        .slider("This is the most accurate way of loading frames.\n\nSelect Frame (Ticks)", sliderMin, sliderMax, {
            valueStep: 1,
            defaultValue: defaultSlider,
        })
        .textField("Enter Frame Tick", "Enter Frame Tick", {
            defaultValue: `${lastCamTick}`,
        });

    replaySettingsForm.show(player).then(async (response) => {
        if (response.canceled || !response.formValues) return;

        const sliderTick = Number(response.formValues[0]);
        const textTick = Number(response.formValues[1]);

        const selectedTick = isNaN(textTick) || sliderTick > textTick ? sliderTick : textTick;
        session.targetFrameTick = Math.min(Math.max(selectedTick, sliderMin), sliderMax);

        removeEntities(player, true);

        session.frameLoaded = true;

        await Promise.all(
            session.trackedPlayers.map(async (p) => {
                await clearStructure(p);
            })
        );

        await Promise.all(
            session.trackedPlayers.map(async (p) => {
                await loadEntity(p);
                await loadBlocksUpToTick(session.targetFrameTick, p);
            })
        );
    });
}

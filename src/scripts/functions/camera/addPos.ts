import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { SharedVariables } from "../../main";
import { disableFlight } from "../player/survival";

export function addPos(player: Player) {
    if (SharedVariables.frameLoaded === false) {
        if (SharedVariables.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.please.load.a.frame.before.adding.camera.point",
                    },
                ],
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    const existingCamPoint = SharedVariables.replayCamPos.find((cam) => cam.tick === SharedVariables.wantLoadFrameTick);
    if (existingCamPoint) {
        if (SharedVariables.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.a.camera.point.already.exists.at.this.tick",
                    },
                ],
            });
        }
        if (SharedVariables.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }
    SharedVariables.frameLoaded = true;
    SharedVariables.startingValueTick = SharedVariables.wantLoadFrameTick;
    SharedVariables.startingValueSecs = Math.floor(SharedVariables.wantLoadFrameTick / 20);

    const { x, y, z } = player.location;
    const spawnLocation = { x: x, y: y + 1.8, z: z };

    const cameraPosTick = SharedVariables.wantLoadFrameTick;
    SharedVariables.replayCamPos.push({
        position: player.getHeadLocation(),
        tick: cameraPosTick,
    });
    SharedVariables.replayCamRot.push({
        rotation: player.getRotation(),
        tick: cameraPosTick,
    });
    const camPos1Entity = player.dimension.spawnEntity("dbg:rccampos" as VanillaEntityIdentifier, spawnLocation);
    camPos1Entity.nameTag = `Camera Point ${SharedVariables.replayCamPos.length}`;
    if (SharedVariables.textPrompt) {
        player.sendMessage(`§4[ReplayCraft] Â§bCamera point added successfully at about ${Math.round(cameraPosTick / 20)} second(s).`);
    }
    // If the player is playing in survival or adventure mode, they will be currently in spectator mode. we need to disable this and return them to their original game mode.
    if (player.getGameMode() === "Spectator") {
        disableFlight(player);
    }
}

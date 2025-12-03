import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";
import { disableFlight } from "../player/survival";
//addCameraPoint = addPos
export function addCameraPoint(player: Player) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage("No session found for player.");
        return;
    }

    if (!session.frameLoaded) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "rc1.mes.please.load.a.frame.before.adding.camera.point",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    const existingCamPoint = session.replayCamPos.find((cam) => cam.tick === session.targetFrameTick);
    if (existingCamPoint) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "rc1.mes.a.camera.point.already.exists.at.this.tick",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    session.startingValueTick = session.targetFrameTick;
    session.startingValueSecs = Math.floor(session.targetFrameTick / 20);

    const { x, y, z } = player.location;
    const spawnLocation = { x, y: y + 1.8, z };

    const cameraPosTick = session.targetFrameTick;

    session.replayCamPos.push({
        position: player.getHeadLocation(),
        tick: cameraPosTick,
    });
    session.replayCamRot.push({
        rotation: player.getRotation(),
        tick: cameraPosTick,
    });

    const camPos1Entity = player.dimension.spawnEntity("dbg:rccampos" as VanillaEntityIdentifier, spawnLocation);
    camPos1Entity.nameTag = `Camera Point ${session.replayCamPos.length}`;
    camPos1Entity.setProperty("rc:rot_x", player.getRotation().x);
    camPos1Entity.setProperty("rc:rot_y", player.getRotation().y);
    camPos1Entity.addTag("owner:" + player.id);

    if (session.textPrompt) {
        player.sendMessage(`§4[ReplayCraft] §bCamera point added successfully at about ${Math.round(cameraPosTick / 20)} second(s).`);
    }
    // If the player is playing in survival or adventure mode, they will be currently in spectator mode. we need to disable this and return them to their original game mode.
    if (player.getGameMode() === "Spectator") {
        disableFlight(player);
    }
}

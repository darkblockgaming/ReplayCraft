import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";

export function addPos(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage("No session found for player.");
        return;
    }

    if (!session.frameLoaded) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.please.load.a.frame.before.adding.camera.point",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    const existingCamPoint = session.replayCamPos.find((cam) => cam.tick === session.wantLoadFrameTick);
    if (existingCamPoint) {
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.a.camera.point.already.exists.at.this.tick",
                    },
                ],
            });
        }
        if (session.soundCue) {
            player.playSound("note.bass");
        }
        return;
    }

    session.startingValueTick = session.wantLoadFrameTick;
    session.startingValueSecs = Math.floor(session.wantLoadFrameTick / 20);

    const { x, y, z } = player.location;
    const spawnLocation = { x, y: y + 1.8, z };

    const cameraPosTick = session.wantLoadFrameTick;

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
    camPos1Entity.addTag("owner:" + player.id);

    if (session.textPrompt) {
        player.sendMessage(`§4[ReplayCraft] §bCamera point added successfully at about ${Math.round(cameraPosTick / 20)} second(s).`);
    }
}

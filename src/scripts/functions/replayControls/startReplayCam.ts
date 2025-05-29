import { EasingType, Player, system } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";

export function startReplayCam(player: Player, startPoint: number = 0) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage({ rawtext: [{ translate: "dbg.rc1.mes.no.replay.session.found" }] });
        return;
    }

    if (session.settCameraType === 0) return;
    if (!(session.repCamTout1Map instanceof Map)) {
        session.repCamTout1Map = new Map();
    }
    if (!(session.repCamTout2Map instanceof Map)) {
        session.repCamTout2Map = new Map();
    }

    session.repCamTout1Map.set(player.id, []);
    session.repCamTout2Map.set(player.id, []);

    const camPos = session.replayCamPos;
    const camRot = session.replayCamRot;

    if (camPos.length === 0 || startPoint >= camPos.length) {
        if (session.textPrompt) {
            player.sendMessage({ rawtext: [{ translate: "dbg.rc1.mes.no.camera.points.found" }] });
        }
        if (session.soundCue) player.playSound("note.bass");
        return;
    }

    const baseTick = camPos[startPoint].tick;
    const ease = session.easeTypes[session.replayCamEase] as keyof typeof EasingType;

    if (session.settCameraType === 1) {
        const firstPoint = camPos[startPoint];
        const firstRot = camRot[startPoint];
        const timeOut1Id = system.runTimeout(() => {
            player.camera.setCamera("minecraft:free", {
                location: firstPoint.position,
                rotation: firstRot.rotation,
            });
        }, 0);
        session.repCamTout1Map.get(player.id).push(timeOut1Id);

        for (let i = startPoint; i < camPos.length - 1; i++) {
            const from = camPos[i];
            const to = camPos[i + 1];
            const toRot = camRot[i + 1];

            const tickDiff = to.tick - from.tick;
            const easingTime = tickDiff / 20;
            const relativeTick = from.tick - baseTick;

            const timeOut2Id = system.runTimeout(() => {
                player.camera.setCamera("minecraft:free", {
                    location: to.position,
                    rotation: toRot.rotation,
                    easeOptions: {
                        easeTime: easingTime,
                        easeType: EasingType[ease],
                    },
                });
            }, relativeTick);
            session.repCamTout2Map.get(player.id).push(timeOut2Id);
        }
    }

    // Types 2, 3, 4 (non-eased) — adapt the same relative tick logic
    if (session.settCameraType === 2) {
        const firstPoint = camPos[startPoint];
        const firstRot = camRot[startPoint];
        const timeOut1Id = system.runTimeout(() => {
            player.camera.setCamera("minecraft:free", {
                location: firstPoint.position,
                rotation: firstRot.rotation,
            });
            session.followCamSwitch = true;
        }, 0);
        session.repCamTout1Map.get(player.id).push(timeOut1Id);
    }

    if (session.settCameraType === 3) {
        const timeOut1Id = system.runTimeout(() => {
            session.topDownCamSwitch = true;
        }, 0);
        session.repCamTout1Map.get(player.id).push(timeOut1Id);
    }

    if (session.settCameraType === 4) {
        const timeOut1Id = system.runTimeout(() => {
            session.topDownCamSwitch2 = true;
        }, 0);
        session.repCamTout1Map.get(player.id).push(timeOut1Id);
    }
}

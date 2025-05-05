import { EasingType, Player, system } from "@minecraft/server";
import { SharedVariables } from "../../main";

export function startReplayCam(player: Player, startPoint: number = 0) {
    if (SharedVariables.settCameraType === 0) return;

    SharedVariables.repCamTout1Map.set(player.id, []);
    SharedVariables.repCamTout2Map.set(player.id, []);

    const camPos = SharedVariables.replayCamPos;
    const camRot = SharedVariables.replayCamRot;

    if (camPos.length === 0 || startPoint >= camPos.length) {
        if (SharedVariables.textPrompt) {
            player.sendMessage({ rawtext: [{ translate: "dbg.rc1.mes.no.camera.points.found" }] });
        }
        if (SharedVariables.soundCue) player.playSound("note.bass");
        return;
    }

    const baseTick = camPos[startPoint].tick;
    const ease = SharedVariables.easeTypes[SharedVariables.replayCamEase] as keyof typeof EasingType;

    if (SharedVariables.settCameraType === 1) {
        const firstPoint = camPos[startPoint];
        const firstRot = camRot[startPoint];
        const timeOut1Id = system.runTimeout(() => {
            player.camera.setCamera("minecraft:free", {
                location: firstPoint.position,
                rotation: firstRot.rotation,
            });
        }, 0);
        SharedVariables.repCamTout1Map.get(player.id).push(timeOut1Id);

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
            SharedVariables.repCamTout2Map.get(player.id).push(timeOut2Id);
        }
    }

    // Types 2, 3, 4 (non-eased) — adapt the same relative tick logic
    if (SharedVariables.settCameraType === 2) {
        const firstPoint = camPos[startPoint];
        const firstRot = camRot[startPoint];
        const timeOut1Id = system.runTimeout(() => {
            player.camera.setCamera("minecraft:free", {
                location: firstPoint.position,
                rotation: firstRot.rotation,
            });
            SharedVariables.followCamSwitch = true;
        }, 0);
        SharedVariables.repCamTout1Map.get(player.id).push(timeOut1Id);
    }

    if (SharedVariables.settCameraType === 3) {
        const timeOut1Id = system.runTimeout(() => {
            SharedVariables.topDownCamSwitch = true;
        }, 0);
        SharedVariables.repCamTout1Map.get(player.id).push(timeOut1Id);
    }

    if (SharedVariables.settCameraType === 4) {
        const timeOut1Id = system.runTimeout(() => {
            SharedVariables.topDownCamSwitch2 = true;
        }, 0);
        SharedVariables.repCamTout1Map.get(player.id).push(timeOut1Id);
    }
}

import { EasingType, Player, system } from "@minecraft/server";
import { replaySessions } from "../../data/replay-player-session";

export function startReplayCam(player: Player, startPoint: number = 0) {
    const session = replaySessions.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage({ rawtext: [{ translate: "rc1.mes.no.replay.session.found" }] });
        return;
    }

    if (session.settingCameraType === 0) return;
    if (!(session.cameraInitTimeoutsMap instanceof Map)) {
        session.cameraInitTimeoutsMap = new Map();
    }
    if (!(session.cameraTransitionTimeoutsMap instanceof Map)) {
        session.cameraTransitionTimeoutsMap = new Map();
    }

    session.cameraInitTimeoutsMap.set(player.id, []);
    session.cameraTransitionTimeoutsMap.set(player.id, []);

    const camPos = session.replayCamPos;
    const camRot = session.replayCamRot;

    if (camPos.length === 0 || startPoint >= camPos.length) {
        if (session.textPrompt) {
            player.sendMessage({ rawtext: [{ translate: "rc1.mes.no.camera.points.found" }] });
        }
        if (session.soundCue) player.playSound("note.bass");
        return;
    }

    const baseTick = camPos[startPoint].tick;
    const ease = session.easeTypes[session.replayCamEase] as keyof typeof EasingType;

    if (session.settingCameraType === 1) {
        const firstPoint = camPos[startPoint];
        const firstRot = camRot[startPoint];
        const timeOut1Id = system.runTimeout(() => {
            player.camera.setCamera("minecraft:free", {
                location: firstPoint.position,
                rotation: firstRot.rotation,
            });
        }, 0);
        session.cameraInitTimeoutsMap.get(player.id).push(timeOut1Id);

        for (let i = startPoint; i < camPos.length - 1; i++) {
            const from = camPos[i];
            const to = camPos[i + 1];
            const toRot = camRot[i + 1];

            const tickDiff = to.tick - from.tick;
            const easingTime = tickDiff / 20;
            const relativeTick = from.tick - baseTick;

            const timeOut2Id = system.runTimeout(() => {
                const distance = calculateDistance(from.position, to.position); // in blocks
                const speedBPS = distance / easingTime; // blocks per second
                session.currentCamTransitionData = {
                    fromIndex: i,
                    toIndex: i + 1,
                    startTick: from.tick,
                    endTick: to.tick,
                    easeTime: easingTime,
                    speedBPS: speedBPS,
                };
                player.camera.setCamera("minecraft:free", {
                    location: to.position,
                    rotation: toRot.rotation,
                    easeOptions: {
                        easeTime: easingTime,
                        easeType: EasingType[ease],
                    },
                });
            }, relativeTick);
            session.cameraTransitionTimeoutsMap.get(player.id).push(timeOut2Id);
        }
    }

    // Types 2, 3, 4 (non-eased) — adapt the same relative tick logic
    if (session.settingCameraType === 2) {
        const firstPoint = camPos[startPoint];
        const firstRot = camRot[startPoint];
        const timeOut1Id = system.runTimeout(() => {
            player.camera.setCamera("minecraft:free", {
                location: firstPoint.position,
                rotation: firstRot.rotation,
            });
            session.isFollowCamActive = true;
        }, 0);
        session.cameraInitTimeoutsMap.get(player.id).push(timeOut1Id);
    }

    if (session.settingCameraType === 3) {
        const timeOut1Id = system.runTimeout(() => {
            session.isTopDownFixedCamActive = true;
        }, 0);
        session.cameraInitTimeoutsMap.get(player.id).push(timeOut1Id);
    }

    if (session.settingCameraType === 4) {
        const timeOut1Id = system.runTimeout(() => {
            session.isTopDownDynamicCamActive = true;
        }, 0);
        session.cameraInitTimeoutsMap.get(player.id).push(timeOut1Id);
    }
    function calculateDistance(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dz = pos2.z - pos1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}

//@ts-check
import { EasingType, system } from "@minecraft/server";
import { SharedVariables } from "../../main";

export function startReplayCam(player) {
    if (SharedVariables.settCameraType === 0) return;

    SharedVariables.repCamTout1Map.set(player.id, []);
    SharedVariables.repCamTout2Map.set(player.id, []);

    if (SharedVariables.settCameraType === 1) {
        const ease = SharedVariables.easeTypes[SharedVariables.replayCamEase];

        if (SharedVariables.replayCamPos.length === 0) {
            if (SharedVariables.textPrompt) {
                player.onScreenDisplay.setActionBar({
                    "rawtext": [{
                        "translate": "dbg.rc1.mes.no.camera.points.found"
                    }]
                });
            }
            if (SharedVariables.soundCue) {
                player.playSound("note.bass");
            }
            return;
        }

        const firstPoint = SharedVariables.replayCamPos[0];
        const firstTick = firstPoint.tick;
        const firstRot = SharedVariables.replayCamRot[0];
        const timeOut1Id = system.runTimeout(() => {
            
            player.camera.setCamera("minecraft:free", {
                location: firstPoint.position,
                rotation: firstRot.rotation,
            });
            
            //player.runCommand(`camera @s set minecraft:free pos ${firstPoint.position} rot ${firstRot.rotation}`);
            //player.onScreenDisplay.setActionBar(`like dirt Interv 1`);
        }, firstTick);
        SharedVariables.repCamTout1Map.get(player.id).push(timeOut1Id);

        for (let i = 0; i < SharedVariables.replayCamPos.length - 1; i++) {
            const startPoint = SharedVariables.replayCamPos[i];
            const endPoint = SharedVariables.replayCamPos[i + 1];
            const startRot = SharedVariables.replayCamRot[i];
            const endRot = SharedVariables.replayCamRot[i + 1];
            const tickDiff = endPoint.tick - startPoint.tick;
            const easetime = tickDiff / 20;
            const timeOut2Id = system.runTimeout(() => {
                //player.onScreenDisplay.setActionBar(`Let = ${replayCamPos.length}, I${i}`);
                
                player.camera.setCamera("minecraft:free", {
                    location: endPoint.position,
                    rotation: endRot.rotation,
                    easeOptions: {
                        easeTime: easetime,
                        easeType: EasingType[ease],
                    },
                });
            
                //player.runCommand(`camera @s set minecraft:free ease ${easetime} ${ease} pos ${endPoint.position} rot ${endRot.rotation}`);
            }, startPoint.tick);
            SharedVariables.repCamTout2Map.get(player.id).push(timeOut2Id);
        }
    }
    if (SharedVariables.settCameraType === 2) {
        if (SharedVariables.settReplayType === 1) return;
        if (SharedVariables.replayCamPos.length === 0) {
            if (SharedVariables.textPrompt) {
                player.onScreenDisplay.setActionBar({
                    "rawtext": [{
                        "translate": "dbg.rc1.mes.no.camera.points.found.add.atleast.one.camera.point"
                    }]
                });
            }
            if (SharedVariables.soundCue) {
                player.playSound("note.bass");
            }
            return;
        }
        const firstPoint = SharedVariables.replayCamPos[0];
        const firstTick = firstPoint.tick;
        const firstRot = SharedVariables.replayCamRot[0];

        const timeOut1Id = system.runTimeout(() => {
            
            player.camera.setCamera("minecraft:free", {
                location: firstPoint.position,
                rotation: firstRot.rotation,
            });
            
            //player.runCommand(`camera @s set minecraft:free pos ${firstPoint.position} rot ${firstRot.rotation}`);
            SharedVariables.followCamSwitch = true;
        }, firstTick);
        SharedVariables.repCamTout1Map.get(player.id).push(timeOut1Id);
    }
    if (SharedVariables.settCameraType === 3) {
        if (SharedVariables.settReplayType === 1) return;
        const firstPoint = SharedVariables.replayCamPos[0];
        const firstTick = firstPoint.tick;
        const timeOut1Id = system.runTimeout(() => {
            //player.runCommand(`camera @s set minecraft:free pos ${location} rot 90 0`);
            SharedVariables.topDownCamSwitch = true;
        }, firstTick);
        SharedVariables.repCamTout1Map.get(player.id).push(timeOut1Id);
    }
    if (SharedVariables.settCameraType === 4) {
        if (SharedVariables.settReplayType === 1) return;
        const firstPoint = SharedVariables.replayCamPos[0];
        const firstTick = firstPoint.tick;
        const timeOut1Id = system.runTimeout(() => {
            //player.runCommand(`camera @s set minecraft:free pos ${location} facing ${location2}`);
            SharedVariables.topDownCamSwitch2 = true;
        }, firstTick);
        SharedVariables.repCamTout1Map.get(player.id).push(timeOut1Id);
    }
}
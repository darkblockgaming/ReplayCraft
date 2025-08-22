import { Player, system, EasingType } from "@minecraft/server";
import { frameDataMap, settingsDataMap, otherDataMap, cameraIntervalMap } from "../../data/maps";
import { easeTypes } from "../../data/constants/constants";

export function startCamera(player: Player) {
    const frames = frameDataMap.get(player.id) ?? [];
    const otherData = otherDataMap.get(player.id);
    const settingsData = settingsDataMap.get(player.id);

    if (otherData.isCameraInMotion === true) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "dbg.rc2.mes.camera.is.already.moving",
        });
        return;
    }

    if (frames.length === 0) {
        player.playSound("note.bass");
        player.sendMessage({
            translate: "",
        });
        return;
    }

    if (settingsData.hideHud === true) {
        player.onScreenDisplay.setHudVisibility(0);
    }

    otherData.isCameraInMotion = true;

    //Set the camera at first frame!!!

    //If camera facing type is manual
    if (settingsData.camFacingType === 1) {
        player.camera.setCamera("minecraft:free", {
            location: frames[0].pos,
            rotation: {
                x: settingsData.camFacingX,
                y: settingsData.camFacingY,
            },
        });
    }
    //if camera facing type is (facing the player)
    else if (settingsData.camFacingType === 2) {
        player.camera.setCamera("minecraft:free", {
            location: frames[0].pos,
            facingEntity: player,
        });
    }
    //if camera facing type is default
    else {
        player.camera.setCamera("minecraft:free", {
            location: frames[0].pos,
            rotation: frames[0].rot,
        });
    }

    let index = 1;
    cameraIntervalMap.set(player.id, []);

    const easetime = settingsData.easetime || 1;
    const easeType = easeTypes[settingsData.easeType];

    function moveNextCameraFrame() {
        //if there are more frames after first frame
        if (index < frames.length) {
            const nextPos = frames[index].pos;
            const nextRot = frames[index].rot;

            if (settingsData.camFacingType === 1) {
                player.camera.setCamera("minecraft:free", {
                    location: nextPos,
                    rotation: {
                        x: settingsData.camFacingX,
                        y: settingsData.camFacingY,
                    },
                    easeOptions: {
                        easeTime: easetime,
                        easeType: EasingType[easeType as keyof typeof EasingType],
                    },
                });
            } else if (settingsData.camFacingType === 2) {
                player.camera.setCamera("minecraft:free", {
                    location: nextPos,
                    facingEntity: player,
                    easeOptions: {
                        easeTime: easetime,
                        easeType: EasingType[easeType as keyof typeof EasingType],
                    },
                });

                //player.runCommand(`camera @s set minecraft:free ease ${currentEaseTime} ${easeType} pos ${nextPos} facing @s`);
            } else {
                player.camera.setCamera("minecraft:free", {
                    location: nextPos,
                    rotation: nextRot,
                    easeOptions: {
                        easeTime: easetime,
                        easeType: EasingType[easeType as keyof typeof EasingType],
                    },
                });
            }

            const intervalId = system.runTimeout(() => {
                index++;
                moveNextCameraFrame();
            }, easetime * 20);
            cameraIntervalMap.get(player.id).push(intervalId);
        }
        //else if there are no frames after last frame
        else {
            const intervalId = system.runTimeout(() => {
                player.camera.clear();
                if (settingsData.hideHud === true) {
                    player.onScreenDisplay.setHudVisibility(1);
                }
                player.sendMessage({
                    translate: "dbg.rc2.mes.camera.movement.complete",
                });
                otherData.isCameraInMotion = false;
            }, 10);
            cameraIntervalMap.get(player.id).push(intervalId);
        }
    }
    //More after a delay of 65 tick after putting the camera at first frame (particles take soem time to dissapear)
    const initialIntervalId = system.runTimeout(() => {
        otherData.isCameraInMotion = true;
        moveNextCameraFrame();
    }, 5);
    cameraIntervalMap.get(player.id).push(initialIntervalId);
}

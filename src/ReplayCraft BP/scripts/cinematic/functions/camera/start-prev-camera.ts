import { Player, system, EasingType } from "@minecraft/server";
import { frameDataMap, settingsDataMap, otherDataMap, cameraIntervalMap } from "../../data/maps";
import { easeTypes } from "../../data/constants/constants";

export function startPreview(player: Player) {
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

    const easetime = settingsData.cinePrevSpeed;
    const easeType = easeTypes[settingsData.easeType];

    player.camera.setCamera("minecraft:free", {
        location: frames[0].pos,
        rotation: frames[0].rot,
    });
    //player.runCommand(`camera @s set minecraft:free pos ${positions[0]} rot ${rotations[0]}`);

    let index = 1;
    cameraIntervalMap.set(player.id, []);

    // Function to transition between frames
    function moveNextCameraFrame() {
        if (index < frames.length) {
            const nextPos = frames[index].pos;
            const nextRot = frames[index].rot;

            player.camera.setCamera("minecraft:free", {
                location: nextPos,
                rotation: nextRot,
                easeOptions: {
                    easeTime: easetime,
                    easeType: EasingType[easeType as keyof typeof EasingType],
                },
            });

            //player.runCommand(`camera @s set minecraft:free ease ${currentEaseTime} ${easeType} pos ${nextPos} rot ${nextRot}`);

            // Move to the next frame after ease time
            const intervalId = system.runTimeout(() => {
                index++;
                moveNextCameraFrame(); // Recursive call to transition to the next frame
            }, easetime * 20); // Convert easeTime from seconds to ticks

            // Save the interval ID for potential stopping later
            cameraIntervalMap.get(player.id).push(intervalId);
        } else {
            // At the last frame, clear the camera with no delay
            player.camera.clear();

            player.sendMessage({
                translate: "dbg.rc2.mes.no.preview.camera.movement.complete",
            });
            otherData.isCameraInMotion = false; // Reset the camera switch flag
        }
    }

    // Start camera movement immediately with no delay
    otherData.isCameraInMotion = true;
    moveNextCameraFrame(); // Begin transitioning to the next frame
}

import { world, system, Player, EasingType } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

showParticle();

const easeTypes = [
    "Linear",
    "InBack",
    "InBounce",
    "InCirc",
    "InCubic",
    "InElastic",
    "InExpo",
    "InOutBack",
    "InOutBounce",
    "InOutCirc",
    "InOutCubic",
    "InOutElastic",
    "InOutExpo",
    "InOutQuad",
    "InOutQuart",
    "InOutQuint",
    "InOutSine",
    "InQuad",
    "InQuart",
    "InQuint",
    "InSine",
    "OutBack",
    "OutBounce",
    "OutCirc",
    "OutCubic",
    "OutElastic",
    "OutExpo",
    "OutQuad",
    "OutQuart",
    "OutQuint",
    "OutSine",
    "Spring",
];
const easeTypesCom = [
    "linear",
    "in_back",
    "in_bounce",
    "in_circ",
    "in_cubic",
    "in_elastic",
    "in_expo",
    "in_out_back",
    "in_out_bounce",
    "in_out_circ",
    "in_out_cubic",
    "in_out_elastic",
    "in_out_expo",
    "in_out_quad",
    "in_out_quart",
    "in_out_quint",
    "in_out_sine",
    "in_quad",
    "in_quart",
    "in_quint",
    "in_sine",
    "out_back",
    "out_bounce",
    "out_circ",
    "out_cubic",
    "out_elastic",
    "out_expo",
    "out_quad",
    "out_quart",
    "out_quint",
    "out_sine",
    "spring",
];
const particlesName = [
    "Heart Particle",
    "Soul Particle",
    "Redstone Torch Dust Particle",
    "Sculk Charge Pop Particle",
    "Sculk Sensor Redstone Particle",
    "Conduit Particle",
    "Conduit Attack Particle",
    "Basic Crit Particle",
    "Shulker Bullet Particle",
    "Villager Angry Particle",
    "Villager Happy Particle",
    "Note Particle",
    "Sparkler Emitter Particle",
    "Dragon Breath Fire Particle",
    "Eye Of Ender Death Explosion Particle",
    "Water Wake Particle",
    "Basic Flame Particle",
    "Blue Flame Particle",
    "Falling Dust Particle",
    "Falling Dust Scaffolding Particle",
    "Falling Dust Top Snow Particle",
    "Border Block Falling Dust Particle",
    "Wax Particle",
];
const particlesStr = [
    "minecraft:heart_particle",
    "minecraft:soul_particle",
    "minecraft:redstone_torch_dust_particle",
    "minecraft:sculk_charge_pop_particle",
    "minecraft:sculk_sensor_redstone_particle",
    "minecraft:conduit_particle",
    "minecraft:conduit_attack_emitter",
    "minecraft:basic_crit_particle",
    "minecraft:shulker_bullet",
    "minecraft:villager_angry",
    "minecraft:villager_happy",
    "minecraft:note_particle",
    "minecraft:sparkler_emitter",
    "minecraft:dragon_breath_fire",
    "minecraft:eyeofender_death_explode_particle",
    "minecraft:water_wake_particle",
    "minecraft:basic_flame_particle",
    "minecraft:blue_flame_particle",
    "minecraft:falling_dust",
    "minecraft:falling_dust_scaffolding_particle",
    "minecraft:falling_dust_top_snow_particle",
    "minecraft:falling_border_dust_particle",
    "minecraft:wax_particle",
];

const cinePDataMap = new Map(); //Pos related data
const cineRDataMap = new Map(); //Rot related data
const cineEDataMap = new Map(); //Extra data
const cineCDataMap = new Map(); //Map for camera switch

function createObj(player: Player) {
    if (!cinePDataMap.has(player.id)) {
        cinePDataMap.set(player.id, {
            cineCamPos: [],
        });
    }
    if (!cineRDataMap.has(player.id)) {
        cineRDataMap.set(player.id, {
            cineCamRot: [],
        });
    }
    if (!cineEDataMap.has(player.id)) {
        cineEDataMap.set(player.id, {
            hideHud: true,
            easeType: 0,
            easingTime: 4,
            camFacingType: 0,
            camFacingX: 0,
            camFacingY: 0,
            cineParType: 0,
            cinePrevSpeed: 0.5,
            cineParSwitch: true,
            cinePrevSpeedMult: 5,
            cineFadeSwitch: true,
            cineRedValue: 37,
            cineGreenValue: 128,
            cineBlueValue: 27,
        });
    }
    if (!cineCDataMap.has(player.id)) {
        cineCDataMap.set(player.id, {
            cineCamSwitch: false,
            cinePrevSwitch: false,
            retrievedFrames: false,
            retrievedSett: false,
        });
    }
}

//==============

function saveFrameDataRC(player: Player) {
    const pData = cinePDataMap.get(player.id);
    const rData = cineRDataMap.get(player.id);

    if (pData) world.setDynamicProperty(`pData_${player.id}`, undefined);
    if (rData) world.setDynamicProperty(`rData_${player.id}`, undefined);

    if (pData) world.setDynamicProperty(`pData_${player.id}`, JSON.stringify(pData));
    if (rData) world.setDynamicProperty(`rData_${player.id}`, JSON.stringify(rData));
}

function retrieveFrameDataRC(player: Player) {
    const pDataString = world.getDynamicProperty(`pData_${player.id}`);
    const rDataString = world.getDynamicProperty(`rData_${player.id}`);
    const cData = cineCDataMap.get(player.id);
    if (cData.retrievedFrames === true) return;

    const retrievedPData = pDataString ? JSON.parse(String(pDataString)) : null;
    const retrievedRData = rDataString ? JSON.parse(String(rDataString)) : null;

    if (retrievedPData) cinePDataMap.set(player.id, retrievedPData);
    if (retrievedRData) cineRDataMap.set(player.id, retrievedRData);

    cData.retrievedFrames = true;
}

function saveSettDataRC(player: Player) {
    const eData = cineEDataMap.get(player.id);
    if (eData) world.setDynamicProperty(`eData_${player.id}`, undefined);
    if (eData) world.setDynamicProperty(`eData_${player.id}`, JSON.stringify(eData));
}

function retrieveSettDataRC(player: Player) {
    const cData = cineCDataMap.get(player.id);
    if (cData.retrievedSett === true) return;
    const eDataString = world.getDynamicProperty(`eData_${player.id}`);
    const retrievedEData = eDataString ? JSON.parse(String(eDataString)) : null;
    if (retrievedEData) cineEDataMap.set(player.id, retrievedEData);
    cData.retrievedSett = true;
}

world.afterEvents.playerSpawn.subscribe((eventData) => {
    const player = eventData.player;
    createObj(player);
    retrieveFrameDataRC(player);
    retrieveSettDataRC(player);
});

//===============================================================

world.afterEvents.itemUse.subscribe((eventData) => {
    const player = eventData.source;
    if (eventData.itemStack?.typeId === "minecraft:blaze_rod" || (eventData.itemStack?.typeId === "minecraft:stick" && /^(Cinematic|cinematic|CINEMATIC|ReplayCraft1|replaycraft1|REPLAYCRAFT1|Replaycraft1)$/.test(eventData.itemStack.nameTag))) {
        ReplayCraft(player);
        createObj(player);
        retrieveFrameDataRC(player);
        retrieveSettDataRC(player);
    }
});

function ReplayCraft(player: Player) {
    //if replayStateMachine.state = recPending
    const replayForm = new ui.ActionFormData()
        .title("dbg.rc2.title.cinematic.menu")
        .button("dbg.rc2.button.add.position.frame") //addFrame
        .button("dbg.rc2.button.start.camera") //startCam
        .button("dbg.rc2.button.preview")
        .button("dbg.rc2.button.stop.camera") //stopCam
        .button("dbg.rc2.button.settings") //settings
        .button("dbg.rc2.button.reset.settings")
        .button("dbg.rc2.button.remove.last.frame") //cine5c
        .button("dbg.rc2.button.remove.all.frames") //cine5
        .body("dbg.rc2.body");
    replayForm.show(player).then((result) => {
        if (result.canceled) return;
        const actions = {
            0: () => addPosFrame(player), //done
            1: () => startCamera(player), //done
            2: () => startPreview(player), //done
            3: () => stopCamera(player),
            4: () => cineSettings(player), //done
            5: () => cineResetSett(player), //done
            6: () => removeLastFrame(player), //done
            7: () => removeAllFrames(player), //done
        };
        const selectedAction = actions[result.selection as keyof typeof actions];
        if (selectedAction) {
            selectedAction();
        }
    });
}

//===============================================================

function addPosFrame(player: Player) {
    const pData = cinePDataMap.get(player.id);
    const rData = cineRDataMap.get(player.id);
    //const eData = cineEDataMap.get(player.id);
    const cData = cineCDataMap.get(player.id);
    if (cData.cineCamSwitch === true) {
        player.playSound("note.bass");
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.cannot.add.frames.while.camera.is.in.motion",
                },
            ],
        });
        return;
    }

    pData.cineCamPos.push(player.getHeadLocation());
    rData.cineCamRot.push(player.getRotation());
    saveFrameDataRC(player);
}

//===============================================================

function startCountdown(player: Player) {
    player.onScreenDisplay.setTitle("Get ready!", {
        stayDuration: 45,
        fadeInDuration: 0,
        fadeOutDuration: 10,
        subtitle: "3",
    });
    player.playSound("note.bell");
    player.playSound("note.cow_bell");
    let countdown = 3;
    const intervalId = system.runInterval(() => {
        const cData = cineCDataMap.get(player.id);
        if (cData.cineCamSwitch === false) {
            system.clearRun(intervalId);
            player.onScreenDisplay.setTitle("Stopped!", {
                stayDuration: 10,
                fadeInDuration: 0,
                fadeOutDuration: 0,
                subtitle: "-- -.-- ....... .. .-. .-.. ....... -. .- -- . ....... .. ... ....... ... .- - -.-- .- --",
            });
            return;
        }
        countdown--;
        player.onScreenDisplay.updateSubtitle(countdown.toString());
        if (countdown !== 0) {
            player.playSound("note.cow_bell");
        }
        if (countdown <= 0) {
            system.clearRun(intervalId);
        }
    }, 20);
}

const cameraIntervalMap = new Map();

function startCamera(player: Player) {
    const pData = cinePDataMap.get(player.id);
    const rData = cineRDataMap.get(player.id);
    const eData = cineEDataMap.get(player.id);
    const cData = cineCDataMap.get(player.id);
    if (cData.cineCamSwitch === true) {
        player.playSound("note.bass");
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.camera.is.already.moving",
                },
            ],
        });
        return;
    }
    if (cData.cinePrevSwitch === true) {
        player.playSound("note.bass");
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.preview.camera.is.already.moving",
                },
            ],
        });
        return;
    }
    if (eData.hideHud === true) {
        player.onScreenDisplay.setHudVisibility(0);
    }

    const positions = pData.cineCamPos;
    const rotations = rData.cineCamRot;
    const easingTime = eData.easingTime || 1;
    const easeType = easeTypes[eData.easeType];
    cData.cineCamSwitch = true;
    if (eData.camFacingType === 1) {
        player.camera.setCamera("minecraft:free", {
            location: positions[0],
            rotation: {
                x: eData.camFacingX,
                y: eData.camFacingY,
            },
        });

        //player.runCommand(`camera @s set minecraft:free pos ${positions[0]} rot ${eData.camFacingX} ${eData.camFacingY}`);
    } else if (eData.camFacingType === 2) {
        player.camera.setCamera("minecraft:free", {
            location: positions[0],
            facingEntity: player,
        });

        //player.runCommand(`camera @s set minecraft:free pos ${positions[0]} facing @s`);
    } else {
        player.camera.setCamera("minecraft:free", {
            location: positions[0],
            rotation: rotations[0],
        });
        //player.runCommand(`camera @s set minecraft:free pos ${positions[0]} rot ${rotations[0]}`);
    }
    startCountdown(player);
    player.runCommand(`camera @s fade time 0 2.5 0.5 color ${eData.cineRedValue} ${eData.cineGreenValue} ${eData.cineBlueValue}`);
    let index = 1;
    cameraIntervalMap.set(player.id, []);

    function moveNextCameraFrame() {
        if (index < positions.length) {
            const nextPos = positions[index];
            const nextRot = rotations[index];

            if (eData.camFacingType === 1) {
                player.camera.setCamera("minecraft:free", {
                    location: nextPos,
                    rotation: {
                        x: eData.camFacingX,
                        y: eData.camFacingY,
                    },
                    easeOptions: {
                        easeTime: easingTime,
                        easeType: EasingType[easeType as keyof typeof EasingType],
                    },
                });

                //player.runCommand(`camera @s set minecraft:free ease ${currentEaseTime} ${easeType} pos ${nextPos} rot ${eData.camFacingX} ${eData.camFacingY}`);
            } else if (eData.camFacingType === 2) {
                player.camera.setCamera("minecraft:free", {
                    location: nextPos,
                    facingEntity: player,
                    easeOptions: {
                        easeTime: easingTime,
                        easeType: EasingType[easeType as keyof typeof EasingType],
                    },
                });

                //player.runCommand(`camera @s set minecraft:free ease ${currentEaseTime} ${easeType} pos ${nextPos} facing @s`);
            } else {
                player.camera.setCamera("minecraft:free", {
                    location: nextPos,
                    rotation: nextRot,
                    easeOptions: {
                        easeTime: easingTime,
                        easeType: EasingType[easeType as keyof typeof EasingType],
                    },
                });
                //player.runCommand(`camera @s set minecraft:free ease ${currentEaseTime} ${easeType} pos ${nextPos} rot ${nextRot}`);
            }

            //player.runCommand(`camera @s set minecraft:free ease ${currentEaseTime} ${easeType} pos ${nextPos} rot ${nextRot}`);

            const intervalId = system.runTimeout(() => {
                index++;
                moveNextCameraFrame();
            }, easingTime * 20);
            cameraIntervalMap.get(player.id).push(intervalId);
        } else {
            const intervalId = system.runTimeout(() => {
                player.camera.clear();
                if (eData.hideHud === true) {
                    player.onScreenDisplay.setHudVisibility(1);
                }
                player.sendMessage({
                    rawtext: [
                        {
                            translate: "dbg.rc2.mes.camera.movement.complete",
                        },
                    ],
                });
                cData.cineCamSwitch = false;
            }, 10);
            cameraIntervalMap.get(player.id).push(intervalId);
        }
    }
    const initialIntervalId = system.runTimeout(() => {
        cData.cineCamSwitch = true;
        moveNextCameraFrame();
    }, 65);
    cameraIntervalMap.get(player.id).push(initialIntervalId);
}

function stopCamera(player: Player) {
    const cData = cineCDataMap.get(player.id);
    if (cData.cineCamSwitch === false) {
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.no.active.camera.movement.to.stop",
                },
            ],
        });
        return;
    }
    cData.cineCamSwitch = false;
    cData.cinePrevSwitch = false;

    const eData = cineEDataMap.get(player.id);
    if (eData.hideHud === true) {
        player.onScreenDisplay.setHudVisibility(1);
    }

    if (cameraIntervalMap.has(player.id)) {
        const intervals = cameraIntervalMap.get(player.id);
        intervals.forEach((intervalId: number) => {
            system.clearRun(intervalId);
        });

        player.camera.clear();

        player.sendMessage(`Camera movement stopped`);
        cameraIntervalMap.delete(player.id);
        cData.cineCamSwitch = false;
        cData.cinePrevSwitch = false;
    } else {
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.no.active.camera.movement.to.stop",
                },
            ],
        });
    }
}

function startPreview(player: Player) {
    const pData = cinePDataMap.get(player.id);
    const rData = cineRDataMap.get(player.id);
    const eData = cineEDataMap.get(player.id);
    const cData = cineCDataMap.get(player.id);
    if (cData.cineCamSwitch === true) {
        player.playSound("note.bass");
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.camera.is.already.moving",
                },
            ],
        });
        return;
    }
    const positions = pData.cineCamPos;
    const rotations = rData.cineCamRot;
    const easingTime = eData.cinePrevSpeed;
    const easeType = easeTypesCom[eData.easeType];

    player.camera.setCamera("minecraft:free", {
        location: positions[0],
        rotation: rotations[0],
    });
    //player.runCommand(`camera @s set minecraft:free pos ${positions[0]} rot ${rotations[0]}`);

    let index = 1;
    cameraIntervalMap.set(player.id, []);

    // Function to transition between frames
    function moveNextCameraFrame() {
        if (index < positions.length) {
            const nextPos = positions[index];
            const nextRot = rotations[index];

            player.camera.setCamera("minecraft:free", {
                location: nextPos,
                rotation: nextRot,
                easeOptions: {
                    easeTime: easingTime,
                    easeType: EasingType[easeType as keyof typeof EasingType],
                },
            });

            //player.runCommand(`camera @s set minecraft:free ease ${currentEaseTime} ${easeType} pos ${nextPos} rot ${nextRot}`);

            // Move to the next frame after ease time
            const intervalId = system.runTimeout(() => {
                index++;
                moveNextCameraFrame(); // Recursive call to transition to the next frame
            }, easingTime * 20); // Convert easeTime from seconds to ticks

            // Save the interval ID for potential stopping later
            cameraIntervalMap.get(player.id).push(intervalId);
        } else {
            // At the last frame, clear the camera with no delay
            player.camera.clear();

            player.sendMessage(`§aPreview camera movement complete §r`);
            cData.cinePrevSwitch = false; // Reset the camera switch flag
        }
    }

    // Start camera movement immediately with no delay
    cData.cinePrevSwitch = true;
    moveNextCameraFrame(); // Begin transitioning to the next frame
}

//player.sendMessage({ "rawtext": [{ "translate": "dbg.rc1." }] });

//===============================================================

function cineSettings(player: Player) {
    //const pData = cinePDataMap.get(player.id);
    //const rData = cineRDataMap.get(player.id);
    const eData = cineEDataMap.get(player.id);
    const cData = cineCDataMap.get(player.id);
    if (cData.cineCamSwitch === true) {
        player.playSound("note.bass");
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.cannot.change.settings.while.camera.is.in.motion",
                },
            ],
        });
        return;
    }
    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc2.title.settings")
        .dropdown("dbg.rc2.dropdown.camera.settings.ease.type", easeTypes, { defaultValueIndex: eData.easeType })
        .textField("dbg.rc2.textfield.time", String(isFinite(eData.easingTime) && eData.easingTime > 0 ? eData.easingTime : 1))
        .dropdown("dbg.rc2.dropdown.camera.facing", ["Default", "Custom Rotation `Select Below`", "Focus On Player"], { defaultValueIndex: eData.camFacingType })

        .slider({ rawtext: [{ translate: "dbg.rc2.slider.pitch" }] }, -90, 90, {
            valueStep: 1,
            defaultValue: eData.camFacingX,
        })
        .slider({ rawtext: [{ translate: "dbg.rc2.slider.yaw" }] }, 0, 360, {
            valueStep: 1,
            defaultValue: eData.camFacingY,
        })
        .dropdown("dbg.rc2.dropdown.particle.Settings.frame.particle.type", particlesName, { defaultValueIndex: eData.cineParType })
        .toggle("dbg.rc2.toggle.enable.position.frame.particles", { defaultValue: eData.cineParSwitch })
        .toggle("dbg.rc2.toggle.hide.hud", { defaultValue: eData.hideHud })

        .slider({ rawtext: [{ translate: "dbg.rc2.slider.preview.settings.preview.speed.multiplier" }] }, 1, 10, {
            valueStep: 1,
            defaultValue: eData.cinePrevSpeedMult,
        })
        //.toggle("\n§l§g- Fade Screen Settings§r\n\nFade Screen", eData.cineFadeSwitch)

        .slider({ rawtext: [{ translate: "dbg.rc2.slider.fade.screen.settings.red.value" }] }, 0, 255, {
            valueStep: 1,
            defaultValue: eData.cineRedValue,
        })
        .slider({ rawtext: [{ translate: "dbg.rc2.slider.green.value" }] }, 0, 255, {
            valueStep: 1,
            defaultValue: eData.cineGreenValue,
        })
        .slider({ rawtext: [{ translate: "dbg.rc2.slider.blue.value" }] }, 0, 255, {
            valueStep: 1,
            defaultValue: eData.cineBlueValue,
        });
    replaySettingsForm.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc2.mes.please.click.submit",
                    },
                ],
            });
            player.playSound("note.bass");
            return;
        }
        eData.easeType = response.formValues[0];
        const parsed = Number(response.formValues[1]);
        eData.easingTime = isNaN(parsed) || parsed <= 0 ? 1 : Math.floor(parsed);

        eData.camFacingType = response.formValues[2];
        eData.camFacingX = response.formValues[3];
        eData.camFacingY = response.formValues[4];
        eData.cineParType = response.formValues[5];
        eData.cineParSwitch = response.formValues[6];
        eData.hideHud = response.formValues[7];
        eData.cinePrevSpeedMult = response.formValues[8];
        eData.cinePrevSpeed = Math.round((1 / eData.cinePrevSpeedMult) * 10) / 10;
        //eData.cineFadeSwitch = response.formValues[8];
        eData.cineRedValue = response.formValues[9];
        eData.cineGreenValue = response.formValues[10];
        eData.cineBlueValue = response.formValues[11];
        saveSettDataRC(player);
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.settings.have.been.saved.successfully",
                },
            ],
        });
    });
}

//===============================================================

function cineResetSett(player: Player) {
    //const pData = cinePDataMap.get(player.id);
    //const rData = cineRDataMap.get(player.id);
    //const eData = cineEDataMap.get(player.id);
    const cData = cineCDataMap.get(player.id);

    if (cData.cineCamSwitch === true) {
        player.playSound("note.bass");
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.cannot.reset.settings.while.camera.is.in.motion",
                },
            ],
        });
        return;
    }
    cineEDataMap.set(player.id, {
        easeType: 1,
        easingTime: 4,
        camFacingType: 0,
        camFacingX: 0,
        camFacingY: 0,
        cineParType: 0,
        cinePrevSpeed: 0.5,
        cineParSwitch: true,
        cinePrevSpeedMult: 5,
        cineFadeSwitch: true,
        cineRedValue: 37,
        cineGreenValue: 128,
        cineBlueValue: 27,
    });
    player.sendMessage({
        rawtext: [
            {
                translate: "dbg.rc2.mes.all.settings.have.been.reset.to.default",
            },
        ],
    });
}

//==============

function removeLastFrame(player: Player) {
    const pData = cinePDataMap.get(player.id);
    const rData = cineRDataMap.get(player.id);
    //const rData = cineRDataMap.get(player.id);
    //const eData = cineEDataMap.get(player.id);
    const cData = cineCDataMap.get(player.id);
    if (cData.cineCamSwitch === true) {
        player.playSound("note.bass");
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.cannot.remove.last.frame.while.camera.is.in.motion",
                },
            ],
        });
        return;
    }
    if (pData.cineCamPos.length === 0) {
        player.playSound("note.bass");
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.no.frames.to.remove",
                },
            ],
        });
        return;
    }
    pData.cineCamPos.pop();
    rData.cineCamRot.pop();
    saveFrameDataRC(player);
    player.sendMessage({
        rawtext: [
            {
                translate: "dbg.rc2.mes.removed.last.frame",
            },
        ],
    });
}

//==============

function removeAllFrames(player: Player) {
    const pData = cinePDataMap.get(player.id);
    const rData = cineRDataMap.get(player.id);
    //const eData = cineEDataMap.get(player.id);
    const cData = cineCDataMap.get(player.id);
    if (cData.cineCamSwitch === true) {
        player.playSound("note.bass");
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.cannot.remove.all.frames.while.camera.is.in.motion",
                },
            ],
        });
        return;
    }

    if (pData.cineCamPos.length === 0) {
        player.playSound("note.bass");
        player.sendMessage({
            rawtext: [
                {
                    translate: "dbg.rc2.mes.no.frames.to.remove",
                },
            ],
        });
        return;
    }
    pData.cineCamPos = [];
    rData.cineCamRot = [];
    saveFrameDataRC(player);
    player.sendMessage({
        rawtext: [
            {
                translate: "dbg.rc2.mes.all.frames.have.been.removed",
            },
        ],
    });
}

//===============================================================

function showParticle() {
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            const pData = cinePDataMap.get(player.id);
            const eData = cineEDataMap.get(player.id);
            const cData = cineCDataMap.get(player.id);

            if (!pData?.cineCamPos?.length || !eData.cineParSwitch || cData.cineCamSwitch) {
                continue;
            }
            const partSelected = particlesStr[eData.cineParType];
            pData.cineCamPos.map((pos: { x: number; y: number; z: number }) => player.runCommand(`particle ${partSelected} ${pos.x} ${pos.y} ${pos.z}`));
        }
    });
}

//==============================================================

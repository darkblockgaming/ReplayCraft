import { world, system } from '@minecraft/server';
import '@minecraft/server-ui';
import * as _0xb90e7 from '@minecraft/server-ui';
import './guideabout.js';
showParticle();
const easeTypes = ["Linear", "InBack", "InBounce", "InCirc", "InCubic", "InElastic", "InExpo", "InOutBack", "InOutBounce", "InOutCirc", "InOutCubic", "InOutElastic", "InOutExpo", "InOutQuad", "InOutQuart", "InOutQuint", "InOutSine", "InQuad", "InQuart", "InQuint", "InSine", "OutBack", "OutBounce", "OutCirc", "OutCubic", "OutElastic", "OutExpo", "OutQuad", "OutQuart", "OutQuint", "OutSine", "Spring"];
const easeTypesCom = ["linear", "in_back", "in_bounce", "in_circ", "in_cubic", "in_elastic", "in_expo", "in_out_back", "in_out_bounce", "in_out_circ", "in_out_cubic", "in_out_elastic", "in_out_expo", "in_out_quad", "in_out_quart", "in_out_quint", "in_out_sine", "in_quad", "in_quart", "in_quint", "in_sine", "out_back", "out_bounce", "out_circ", "out_cubic", "out_elastic", "out_expo", "out_quad", "out_quart", "out_quint", "out_sine", "spring"];
const particlesName = ["Heart Particle", "Soul Particle", "Redstone Torch Dust Particle", "Sculk Charge Pop Particle", "Sculk Sensor Redstone Particle", "Conduit Particle", "Conduit Attack Particle", "Basic Crit Particle", "Shulker Bullet Particle", "Villager Angry Particle", "Villager Happy Particle", "Note Particle", "Sparkler Emitter Particle", "Dragon Breath Fire Particle", "Eye Of Ender Death Explosion Particle", "Water Wake Particle", "Basic Flame Particle", "Blue Flame Particle", "Falling Dust Particle", "Falling Dust Scaffolding Particle", "Falling Dust Top Snow Particle", "Border Block Falling Dust Particle", "Wax Particle"];
const particlesStr = ["minecraft:heart_particle", "minecraft:soul_particle", "minecraft:redstone_torch_dust_particle", "minecraft:sculk_charge_pop_particle", "minecraft:sculk_sensor_redstone_particle", "minecraft:conduit_particle", "minecraft:conduit_attack_emitter", "minecraft:basic_crit_particle", "minecraft:shulker_bullet", "minecraft:villager_angry", "minecraft:villager_happy", "minecraft:note_particle", "minecraft:sparkler_emitter", "minecraft:dragon_breath_fire", "minecraft:eyeofender_death_explode_particle", "minecraft:water_wake_particle", "minecraft:basic_flame_particle", "minecraft:blue_flame_particle", "minecraft:falling_dust", "minecraft:falling_dust_scaffolding_particle", "minecraft:falling_dust_top_snow_particle", "minecraft:falling_border_dust_particle", "minecraft:wax_particle"];
const cinePDataMap = new Map();
const cineRDataMap = new Map();
const cineEDataMap = new Map();
const cineCDataMap = new Map();
function createObj(_0x6a0dbf) {
  if (!cinePDataMap.has(_0x6a0dbf.id)) {
    cinePDataMap.set(_0x6a0dbf.id, {
      'cineCamPos': []
    });
  }
  if (!cineRDataMap.has(_0x6a0dbf.id)) {
    cineRDataMap.set(_0x6a0dbf.id, {
      'cineCamRot': []
    });
  }
  if (!cineEDataMap.has(_0x6a0dbf.id)) {
    cineEDataMap.set(_0x6a0dbf.id, {
      'easeType': 0x0,
      'easeTime': 0x4,
      'camFacingType': 0x0,
      'camFacingX': 0x0,
      'camFacingY': 0x0,
      'cineParType': 0x0,
      'cinePrevSpeed': 0.5,
      'cineParSwitch': true,
      'cinePrevSpeedMult': 0x5,
      'cineFadeSwitch': true,
      'cineRedValue': 0x25,
      'cineGreenValue': 0x80,
      'cineBlueValue': 0x1b
    });
  }
  if (!cineCDataMap.has(_0x6a0dbf.id)) {
    cineCDataMap.set(_0x6a0dbf.id, {
      'cineCamSwitch': false,
      'cinePrevSwitch': false,
      'retrievedFrames': false,
      'retrievedSett': false
    });
  }
}
function saveFrameDataRC(_0x56d827) {
  const _0x1deaa3 = cinePDataMap.get(_0x56d827.id);
  const _0x1bd3cb = cineRDataMap.get(_0x56d827.id);
  if (_0x1deaa3) {
    world.setDynamicProperty("pData_" + _0x56d827.id, undefined);
  }
  if (_0x1bd3cb) {
    world.setDynamicProperty("rData_" + _0x56d827.id, undefined);
  }
  if (_0x1deaa3) {
    world.setDynamicProperty("pData_" + _0x56d827.id, JSON.stringify(_0x1deaa3));
  }
  if (_0x1bd3cb) {
    world.setDynamicProperty("rData_" + _0x56d827.id, JSON.stringify(_0x1bd3cb));
  }
}
function retrieveFrameDataRC(_0xbe2156) {
  const _0x316763 = world.getDynamicProperty("pData_" + _0xbe2156.id);
  const _0x2f6dbb = world.getDynamicProperty("rData_" + _0xbe2156.id);
  const _0x22160d = cineCDataMap.get(_0xbe2156.id);
  if (_0x22160d.retrievedFrames === true) {
    return;
  }
  const _0x7636c4 = _0x316763 ? JSON.parse(_0x316763) : null;
  const _0x288d1d = _0x2f6dbb ? JSON.parse(_0x2f6dbb) : null;
  if (_0x7636c4) {
    cinePDataMap.set(_0xbe2156.id, _0x7636c4);
  }
  if (_0x288d1d) {
    cineRDataMap.set(_0xbe2156.id, _0x288d1d);
  }
  _0x22160d.retrievedFrames = true;
}
function saveSettDataRC(_0x20f453) {
  const _0x494ea5 = cineEDataMap.get(_0x20f453.id);
  if (_0x494ea5) {
    world.setDynamicProperty("eData_" + _0x20f453.id, undefined);
  }
  if (_0x494ea5) {
    world.setDynamicProperty("eData_" + _0x20f453.id, JSON.stringify(_0x494ea5));
  }
}
function retrieveSettDataRC(_0x15c3bd) {
  const _0x5ccb0c = cineCDataMap.get(_0x15c3bd.id);
  if (_0x5ccb0c.retrievedSett === true) {
    return;
  }
  const _0x1713d9 = world.getDynamicProperty("eData_" + _0x15c3bd.id);
  const _0x5db164 = _0x1713d9 ? JSON.parse(_0x1713d9) : null;
  if (_0x5db164) {
    cineEDataMap.set(_0x15c3bd.id, _0x5db164);
  }
  _0x5ccb0c.retrievedSett = true;
}
world.afterEvents.playerSpawn.subscribe(_0x29dcc5 => {
  const _0x1f9679 = _0x29dcc5.player;
  createObj(_0x1f9679);
  retrieveFrameDataRC(_0x1f9679);
  retrieveSettDataRC(_0x1f9679);
});
world.afterEvents.itemUse.subscribe(_0x21c8c2 => {
  const _0x4b2cf9 = _0x21c8c2.source;
  if (_0x21c8c2.itemStack?.["typeId"] === "minecraft:blaze_rod" || _0x21c8c2.itemStack?.["typeId"] === "minecraft:stick" && /^(Cinematic|cinematic|CINEMATIC|ReplayCraft1|replaycraft1|REPLAYCRAFT1|Replaycraft1)$/.test(_0x21c8c2.itemStack.nameTag)) {
    ReplayCraft(_0x4b2cf9);
    createObj(_0x4b2cf9);
    retrieveFrameDataRC(_0x4b2cf9);
    retrieveSettDataRC(_0x4b2cf9);
  }
});
function ReplayCraft(_0x5b09f1) {
  const _0x430033 = new _0xb90e7.ActionFormData().title("dbg.rc2.title.cinematic.menu").button("dbg.rc2.button.add.position.frame").button("dbg.rc2.button.start.camera").button("dbg.rc2.button.preview").button("dbg.rc2.button.stop.camera").button("dbg.rc2.button.settings").button("dbg.rc2.button.reset.settings").button("dbg.rc2.button.remove.last.frame").button("dbg.rc2.button.remove.all.frames").body("dbg.rc2.body");
  _0x430033.show(_0x5b09f1).then(_0x31692a => {
    if (_0x31692a.canceled) {
      return;
    }
    const _0x13532a = {
      0x0: () => addPosFrame(_0x5b09f1),
      0x1: () => startCamera(_0x5b09f1),
      0x2: () => startPreview(_0x5b09f1),
      0x3: () => stopCamera(_0x5b09f1),
      0x4: () => cineSettings(_0x5b09f1),
      0x5: () => cineResetSett(_0x5b09f1),
      0x6: () => removeLastFrame(_0x5b09f1),
      0x7: () => removeAllFrames(_0x5b09f1)
    };
    const _0x3bce1b = _0x13532a[_0x31692a.selection];
    if (_0x3bce1b) {
      _0x3bce1b();
    }
  });
}
function addPosFrame(_0x57115c) {
  const _0x494fd1 = cinePDataMap.get(_0x57115c.id);
  const _0xe51c78 = cineRDataMap.get(_0x57115c.id);
  const _0x1cfe17 = cineCDataMap.get(_0x57115c.id);
  if (_0x1cfe17.cineCamSwitch === true) {
    _0x57115c.playSound("note.bass");
    _0x57115c.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.cannot.add.frames.while.camera.is.in.motion"
      }]
    });
    return;
  }
  const {
    x: _0x533133,
    y: _0x42f3f1,
    z: _0x33767d
  } = _0x57115c.location;
  const _0x367519 = _0x57115c.getRotation().x;
  const _0x35e576 = _0x57115c.getRotation().y;
  const _0xe09eb = _0x533133 + " " + (_0x42f3f1 + 1.8) + " " + _0x33767d;
  const _0x2ae099 = _0x367519 + " " + _0x35e576;
  _0x494fd1.cineCamPos.push(_0xe09eb);
  _0xe51c78.cineCamRot.push(_0x2ae099);
  saveFrameDataRC(_0x57115c);
}
function startCountdown(_0x555779) {
  _0x555779.onScreenDisplay.setTitle("Get ready!", {
    'stayDuration': 0x32,
    'fadeInDuration': 0x0,
    'fadeOutDuration': 0xa,
    'subtitle': '3'
  });
  _0x555779.playSound("note.bell");
  _0x555779.playSound("note.cow_bell");
  let _0x3ec4d5 = 3;
  const _0x34f884 = system.runInterval(() => {
    _0x3ec4d5--;
    _0x555779.onScreenDisplay.updateSubtitle(_0x3ec4d5.toString());
    if (_0x3ec4d5 !== 0) {
      _0x555779.playSound("note.cow_bell");
    }
    if (_0x3ec4d5 <= 0) {
      system.clearRun(_0x34f884);
    }
  }, 20);
}
const cameraIntervalMap = new Map();
function startCamera(_0x356774) {
  const _0x458aad = cinePDataMap.get(_0x356774.id);
  const _0x47f6a4 = cineRDataMap.get(_0x356774.id);
  const _0x31a2d7 = cineEDataMap.get(_0x356774.id);
  const _0x1acd02 = cineCDataMap.get(_0x356774.id);
  if (_0x1acd02.cineCamSwitch === true) {
    _0x356774.playSound("note.bass");
    _0x356774.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.camera.is.already.moving"
      }]
    });
    return;
  }
  if (_0x1acd02.cinePrevSwitch === true) {
    _0x356774.playSound("note.bass");
    _0x356774.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.preview.camera.is.already.moving"
      }]
    });
    return;
  }
  const _0x4a4ffc = _0x458aad.cineCamPos;
  const _0x693bfd = _0x47f6a4.cineCamRot;
  const _0x578b41 = _0x31a2d7.easeTime || 1;
  const _0xb1bd46 = easeTypesCom[_0x31a2d7.easeType];
  _0x1acd02.cineCamSwitch = true;
  if (_0x31a2d7.camFacingType === 1) {
    _0x356774.runCommand("camera @s set minecraft:free pos " + _0x4a4ffc[0] + " rot " + _0x31a2d7.camFacingX + " " + _0x31a2d7.camFacingY);
  } else if (_0x31a2d7.camFacingType === 2) {
    _0x356774.runCommand("camera @s set minecraft:free pos " + _0x4a4ffc[0] + " facing @s");
  } else {
    _0x356774.runCommand("camera @s set minecraft:free pos " + _0x4a4ffc[0] + " rot " + _0x693bfd[0]);
  }
  startCountdown(_0x356774);
  _0x356774.runCommand("camera @s fade time 0 2.5 0.5 color " + _0x31a2d7.cineRedValue + " " + _0x31a2d7.cineGreenValue + " " + _0x31a2d7.cineBlueValue);
  let _0x4bf150 = 1;
  cameraIntervalMap.set(_0x356774.id, []);
  function _0x46d0be() {
    if (_0x4bf150 < _0x4a4ffc.length) {
      const _0x23b050 = _0x4a4ffc[_0x4bf150];
      const _0x33349a = _0x693bfd[_0x4bf150];
      if (_0x31a2d7.camFacingType === 1) {
        _0x356774.runCommand("camera @s set minecraft:free ease " + _0x578b41 + " " + _0xb1bd46 + " pos " + _0x23b050 + " rot " + _0x31a2d7.camFacingX + " " + _0x31a2d7.camFacingY);
      } else if (_0x31a2d7.camFacingType === 2) {
        _0x356774.runCommand("camera @s set minecraft:free ease " + _0x578b41 + " " + _0xb1bd46 + " pos " + _0x23b050 + " facing @s");
      } else {
        _0x356774.runCommand("camera @s set minecraft:free ease " + _0x578b41 + " " + _0xb1bd46 + " pos " + _0x23b050 + " rot " + _0x33349a);
      }
      const _0x19d45c = system.runTimeout(() => {
        _0x4bf150++;
        _0x46d0be();
      }, _0x578b41 * 20);
      cameraIntervalMap.get(_0x356774.id).push(_0x19d45c);
    } else {
      const _0x58b224 = system.runTimeout(() => {
        _0x356774.runCommand("camera @s clear");
        _0x356774.onScreenDisplay.setActionBar({
          'rawtext': [{
            'translate': "dbg.rc2.mes.camera.movement.complete"
          }]
        });
        _0x1acd02.cineCamSwitch = false;
      }, 10);
      cameraIntervalMap.get(_0x356774.id).push(_0x58b224);
    }
  }
  const _0x277dcc = system.runTimeout(() => {
    _0x1acd02.cineCamSwitch = true;
    _0x46d0be();
  }, 65);
  cameraIntervalMap.get(_0x356774.id).push(_0x277dcc);
}
function stopCamera(_0x310b1b) {
  const _0x6b44c7 = cineCDataMap.get(_0x310b1b.id);
  if (_0x6b44c7.cineCamSwitch = false) {
    _0x310b1b.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.no.active.camera.movement.to.stop"
      }]
    });
    return;
  }
  if (cameraIntervalMap.has(_0x310b1b.id)) {
    const _0x2d2ad5 = cameraIntervalMap.get(_0x310b1b.id);
    _0x2d2ad5.forEach(_0x3c712e => {
      system.clearRun(_0x3c712e);
    });
    _0x310b1b.runCommand("camera @s clear");
    _0x310b1b.onScreenDisplay.setActionBar("Camera movement stopped");
    cameraIntervalMap["delete"](_0x310b1b.id);
    const _0x2ed229 = cineCDataMap.get(_0x310b1b.id);
    _0x2ed229.cineCamSwitch = false;
    _0x2ed229.cinePrevSwitch = false;
  } else {
    _0x310b1b.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.no.active.camera.movement.to.stop"
      }]
    });
  }
}
function startPreview(_0x5ca88c) {
  const _0x143af6 = cinePDataMap.get(_0x5ca88c.id);
  const _0x3bf3b1 = cineRDataMap.get(_0x5ca88c.id);
  const _0x491f89 = cineEDataMap.get(_0x5ca88c.id);
  const _0xe2acb6 = cineCDataMap.get(_0x5ca88c.id);
  if (_0xe2acb6.cineCamSwitch === true) {
    _0x5ca88c.playSound("note.bass");
    _0x5ca88c.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.camera.is.already.moving"
      }]
    });
    return;
  }
  const _0xa7d3ec = _0x143af6.cineCamPos;
  const _0x8122fe = _0x3bf3b1.cineCamRot;
  const _0x17603d = _0x491f89.cinePrevSpeed;
  const _0xd0f0d1 = easeTypesCom[_0x491f89.easeType];
  _0x5ca88c.runCommand("camera @s set minecraft:free pos " + _0xa7d3ec[0] + " rot " + _0x8122fe[0]);
  let _0x51a888 = 1;
  cameraIntervalMap.set(_0x5ca88c.id, []);
  function _0x59394d() {
    if (_0x51a888 < _0xa7d3ec.length) {
      const _0x392788 = _0xa7d3ec[_0x51a888];
      const _0x244c76 = _0x8122fe[_0x51a888];
      _0x5ca88c.runCommand("camera @s set minecraft:free ease " + _0x17603d + " " + _0xd0f0d1 + " pos " + _0x392788 + " rot " + _0x244c76);
      const _0x29f5d3 = system.runTimeout(() => {
        _0x51a888++;
        _0x59394d();
      }, _0x17603d * 20);
      cameraIntervalMap.get(_0x5ca88c.id).push(_0x29f5d3);
    } else {
      _0x5ca88c.runCommand("camera @s clear");
      _0x5ca88c.onScreenDisplay.setActionBar("§aPreview camera movement complete §r");
      _0xe2acb6.cinePrevSwitch = false;
    }
  }
  _0xe2acb6.cinePrevSwitch = true;
  _0x59394d();
}
function cineSettings(_0x15b6d0) {
  const _0x608a6a = cineEDataMap.get(_0x15b6d0.id);
  const _0x1b2b7c = cineCDataMap.get(_0x15b6d0.id);
  if (_0x1b2b7c.cineCamSwitch === true) {
    _0x15b6d0.playSound("note.bass");
    _0x15b6d0.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.cannot.change.settings.while.camera.is.in.motion"
      }]
    });
    return;
  }
  const _0x3f6aeb = new _0xb90e7.ModalFormData().title("dbg.rc2.title.settings").dropdown("dbg.rc2.dropdown.camera.settings.ease.type", easeTypes, _0x608a6a.easeType).textField("dbg.rc2.textfield.time", '' + _0x608a6a.easeTime).dropdown("dbg.rc2.dropdown.camera.facing", ["Default", "Custom Rotation `Select Below`", "Focus On Player"], _0x608a6a.camFacingType).slider({
    'rawtext': [{
      'translate': "dbg.rc2.slider.pitch"
    }]
  }, -90, 90, 1, _0x608a6a.camFacingX).slider({
    'rawtext': [{
      'translate': "dbg.rc2.slider.yaw"
    }]
  }, 0, 360, 1, _0x608a6a.camFacingY).dropdown("dbg.rc2.dropdown.particle.Settings.frame.particle.type", particlesName, _0x608a6a.cineParType).toggle("dbg.rc2.toggle.enable.position.frame.particles", _0x608a6a.cineParSwitch).slider({
    'rawtext': [{
      'translate': "dbg.rc2.slider.preview.settings.preview.speed.multiplier"
    }]
  }, 1, 10, 1, _0x608a6a.cinePrevSpeedMult).slider({
    'rawtext': [{
      'translate': "dbg.rc2.slider.fade.screen.settings.red.value"
    }]
  }, 0, 225, 1, _0x608a6a.cineRedValue).slider({
    'rawtext': [{
      'translate': "dbg.rc2.slider.green.value"
    }]
  }, 0, 225, 1, _0x608a6a.cineGreenValue).slider({
    'rawtext': [{
      'translate': "dbg.rc2.slider.blue.value"
    }]
  }, 0, 225, 1, _0x608a6a.cineBlueValue);
  _0x3f6aeb.show(_0x15b6d0).then(_0x1c5648 => {
    if (_0x1c5648.canceled) {
      _0x15b6d0.onScreenDisplay.setActionBar({
        'rawtext': [{
          'translate': "dbg.rc2.mes.please.click.submit"
        }]
      });
      _0x15b6d0.playSound("note.bass");
      return;
    }
    _0x608a6a.easeType = _0x1c5648.formValues[0];
    _0x608a6a.easeTime = _0x1c5648.formValues[1] != null && _0x1c5648.formValues[1] > 0 ? _0x1c5648.formValues[1] : 1;
    _0x608a6a.camFacingType = _0x1c5648.formValues[2];
    _0x608a6a.camFacingX = _0x1c5648.formValues[3];
    _0x608a6a.camFacingY = _0x1c5648.formValues[4];
    _0x608a6a.cineParType = _0x1c5648.formValues[5];
    _0x608a6a.cineParSwitch = _0x1c5648.formValues[6];
    _0x608a6a.cinePrevSpeedMult = _0x1c5648.formValues[7];
    _0x608a6a.cinePrevSpeed = Math.round(1 / _0x608a6a.cinePrevSpeedMult * 10) / 10;
    _0x608a6a.cineRedValue = _0x1c5648.formValues[8];
    _0x608a6a.cineGreenValue = _0x1c5648.formValues[9];
    _0x608a6a.cineBlueValue = _0x1c5648.formValues[10];
    saveSettDataRC(_0x15b6d0);
    _0x15b6d0.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.settings.have.been.saved.successfully"
      }]
    });
  });
}
function cineResetSett(_0x51fdb2) {
  const _0x435fa6 = cineCDataMap.get(_0x51fdb2.id);
  if (_0x435fa6.cineCamSwitch === true) {
    _0x51fdb2.playSound("note.bass");
    _0x51fdb2.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.cannot.reset.settings.while.camera.is.in.motion"
      }]
    });
    return;
  }
  cineEDataMap.set(_0x51fdb2.id, {
    'easeType': 0x1,
    'easeTime': 0x4,
    'camFacingType': 0x0,
    'camFacingX': 0x0,
    'camFacingY': 0x0,
    'cineParType': 0x0,
    'cinePrevSpeed': 0.5,
    'cineParSwitch': true,
    'cinePrevSpeedMult': 0x5,
    'cineFadeSwitch': true,
    'cineRedValue': 0x25,
    'cineGreenValue': 0x80,
    'cineBlueValue': 0x1b
  });
  _0x51fdb2.onScreenDisplay.setActionBar({
    'rawtext': [{
      'translate': "dbg.rc2.mes.all.settings.have.been.reset.to.default"
    }]
  });
}
function removeLastFrame(_0x1afb99) {
  const _0x420dbd = cinePDataMap.get(_0x1afb99.id);
  const _0x256e09 = cineCDataMap.get(_0x1afb99.id);
  if (_0x256e09.cineCamSwitch === true) {
    _0x1afb99.playSound("note.bass");
    _0x1afb99.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.cannot.remove.last.frame.while.camera.is.in.motion"
      }]
    });
    return;
  }
  if (_0x420dbd.cineCamPos.length === 0) {
    _0x1afb99.playSound("note.bass");
    _0x1afb99.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.no.frames.to.remove"
      }]
    });
    return;
  }
  saveFrameDataRC(_0x1afb99);
  _0x1afb99.onScreenDisplay.setActionBar({
    'rawtext': [{
      'translate': "dbg.rc2.mes.removed.last.frame"
    }]
  });
}
function removeAllFrames(_0x4b2166) {
  const _0x713977 = cinePDataMap.get(_0x4b2166.id);
  const _0x208664 = cineRDataMap.get(_0x4b2166.id);
  const _0x371275 = cineCDataMap.get(_0x4b2166.id);
  if (_0x371275.cineCamSwitch === true) {
    _0x4b2166.playSound("note.bass");
    _0x4b2166.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.cannot.remove.all.frames.while.camera.is.in.motion"
      }]
    });
    return;
  }
  if (_0x713977.cineCamPos.length === 0) {
    _0x4b2166.playSound("note.bass");
    _0x4b2166.onScreenDisplay.setActionBar({
      'rawtext': [{
        'translate': "dbg.rc2.mes.no.frames.to.remove"
      }]
    });
    return;
  }
  _0x713977.cineCamPos = [];
  _0x208664.cineCamRot = [];
  saveFrameDataRC(_0x4b2166);
  _0x4b2166.onScreenDisplay.setActionBar({
    'rawtext': [{
      'translate': "dbg.rc2.mes.all.frames.have.been.removed"
    }]
  });
}
function showParticle() {
  system.runInterval(() => {
    for (const _0x85abf8 of world.getPlayers()) {
      const _0x477810 = cinePDataMap.get(_0x85abf8.id);
      const _0x5f24de = cineEDataMap.get(_0x85abf8.id);
      const _0x556b3e = cineCDataMap.get(_0x85abf8.id);
      if (!_0x477810?.["cineCamPos"]?.["length"] || !_0x5f24de.cineParSwitch || _0x556b3e.cineCamSwitch) {
        continue;
      }
      const _0x2a1612 = particlesStr[_0x5f24de.cineParType];
      _0x477810.cineCamPos.map(_0x49f6c0 => _0x85abf8.runCommand("particle " + _0x2a1612 + " " + _0x49f6c0));
    }
  });
}
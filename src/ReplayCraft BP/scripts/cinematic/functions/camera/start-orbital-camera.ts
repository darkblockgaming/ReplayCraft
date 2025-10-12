import { Player, EasingType, system } from "@minecraft/server";
import { frameDataMap, cineRuntimeDataMap, cameraIntervalMap, settingsDataMap } from "../../data/maps";
import { removeAllFrameEntities } from "../entity/remove-all-frame-entities";

/**
 * Start an infinite orbital camera around the first frame.
 */
export function startOrbitalCamera(player: Player) {
  const cineRuntimeData = cineRuntimeDataMap.get(player.id);
  const frames = frameDataMap.get(cineRuntimeData?.loadedCinematic ?? "") ?? [];
  const settingsData = settingsDataMap.get(cineRuntimeData.loadedCinematic);

  if (!cineRuntimeData || !settingsData) return;
  const focusPoint = frames[0];
  if (!focusPoint) return;

  removeAllFrameEntities(player);

  // Clear any existing camera intervals
  const existing = cameraIntervalMap.get(player.id);
  if (existing) existing.forEach((id) => system.clearRun(id));
  cameraIntervalMap.set(player.id, []);

  cineRuntimeData.isCameraInMotion = true;

  // Customisable parameters
  const orbitalSpeedBlocks = settingsData.orbitalSpeed ?? 2.0; // blocks per second
  const orbitalRadius = settingsData.orbitalRadius ?? 6;
  const orbitalHeightOffset = settingsData.orbitalHeightOffset ?? 0;

  // Prevent divide-by-zero if radius = 0
  const safeRadius = Math.max(0.001, orbitalRadius);

  // Angular speed (radians per second)
  const radiansPerSec = orbitalSpeedBlocks / safeRadius;

  // Convert to radians per tick (20 ticks per sec)
  const radiansPerTick = radiansPerSec / 20;

  // Ease time — automatically scale with speed but clamp between 0.1s and 0.5s
  const ORBITAL_EASE_TIME = Math.max(0.1, Math.min(0.5, 0.3 - orbitalSpeedBlocks * 0.005));

  const directionMultiplier = settingsData.orbitalRotDir === "clockwise" ? 1 : -1;
  let angle = 0;

  // Initial setup
  player.camera.setCamera("minecraft:free", {
    location: {
      x: focusPoint.pos.x + orbitalRadius,
      y: focusPoint.pos.y + orbitalHeightOffset,
      z: focusPoint.pos.z,
    },
    facingLocation: focusPoint.pos,
  });

  // Orbit motion
  const intervalId = system.runInterval(() => {
    angle += radiansPerTick * directionMultiplier;

    const cameraPos = {
      x: focusPoint.pos.x + orbitalRadius * Math.cos(angle),
      y: focusPoint.pos.y + orbitalHeightOffset,
      z: focusPoint.pos.z + orbitalRadius * Math.sin(angle),
    };

    player.camera.setCamera("minecraft:free", {
      location: cameraPos,
      facingLocation: focusPoint.pos,
      easeOptions: {
        easeTime: ORBITAL_EASE_TIME,
        easeType: EasingType.Linear,
      },
    });
  }, 1);

  cameraIntervalMap.get(player.id)!.push(intervalId);
}

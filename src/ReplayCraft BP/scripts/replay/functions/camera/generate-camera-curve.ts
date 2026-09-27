// Adapted from the original standalone script's `generateCurve` (Catmull-Rom spline).
// Difference vs the original: the original pulled positions from a temporary array
// filled every tick while recording (`camera_pos` / `camera_time`), built purely from
// the player's own location. Here the control points already live on the session as
// `session.replayCamPos` / `session.replayCamRot` (each `{ position, tick }` /
// `{ rotation, tick }`), captured whenever the player places the "dbg:rccampos" marker
// entity. The entity itself is only a visual marker in the world — it is never read
// back for the math, so the two data sources are equivalent for this algorithm and no
// entity lookups are needed here.
//
// The native "Cinematic Cam" (settingCameraType === 1) eases in a straight line from
// point A to point B. This helper instead samples a smooth curve that bends through
// every neighboring point (Catmull-Rom), then returns one waypoint every `stepTicks`
// ticks so start-replay-camera.ts can schedule many small camera.setCamera calls
// instead of one long straight-line ease.

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface Rotation2D {
    x: number;
    y: number;
}

interface CameraPoint {
    position: Vector3;
    tick: number;
    instant?: boolean;
}

interface CameraRotation {
    rotation: Rotation2D;
    tick: number;
}

interface Waypoint {
    position: Vector3;
    rotation: Rotation2D;
    tick: number;
}

function catmullRomComponent(v0: number, v1: number, v2: number, v3: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * ((2 * v1) + (-v0 + v2) * t +
        (2 * v0 - 5 * v1 + 4 * v2 - v3) * t2 +
        (-v0 + 3 * v1 - 3 * v2 + v3) * t3);
}

function catmullRomVec3(v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3, t: number): Vector3 {
    return {
        x: catmullRomComponent(v0.x, v1.x, v2.x, v3.x, t),
        y: catmullRomComponent(v0.y, v1.y, v2.y, v3.y, t),
        z: catmullRomComponent(v0.z, v1.z, v2.z, v3.z, t),
    };
}

// Yaw (rotation.y) wraps at +-180, so it needs unwrapping relative to the segment's
// own r1 before running it through the spline, otherwise a pan across the +-180 seam
// (e.g. 179 -> -179) spins the camera the long way around instead of the short way.
function unwrap(base: number, angle: number): number {
    let a = angle;
    while (a - base > 180) a -= 360;
    while (a - base < -180) a += 360;
    return a;
}

function wrapDeg(angle: number): number {
    let a = angle % 360;
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    return a;
}

function catmullRomRot(r0: Rotation2D, r1: Rotation2D, r2: Rotation2D, r3: Rotation2D, t: number): Rotation2D {
    const x = catmullRomComponent(r0.x, r1.x, r2.x, r3.x, t);
    const y0 = unwrap(r1.y, r0.y);
    const y2 = unwrap(r1.y, r2.y);
    const y3 = unwrap(r1.y, r3.y);
    const y = wrapDeg(catmullRomComponent(y0, r1.y, y2, y3, t));
    return { x, y };
}

/**
 * Generate a smooth Catmull-Rom spline through camera control points, returning
 * waypoints sampled at regular tick intervals.
 * @param camPos - Array of camera positions with tick timestamps
 * @param camRot - Array of camera rotations with tick timestamps
 * @param stepTicks - Sample resolution in ticks (1 = one waypoint per tick for smoothest result)
 * @returns Array of interpolated waypoints along the spline
 */
export function generateCameraCurve(camPos: CameraPoint[], camRot: CameraRotation[], stepTicks: number = 1): Waypoint[] {
    const waypoints: Waypoint[] = [];

    if (camPos.length === 0)
        return waypoints;

    if (camPos.length === 1) {
        waypoints.push({ position: camPos[0].position, rotation: camRot[0].rotation, tick: camPos[0].tick });
        return waypoints;
    }

    const step = Math.max(1, Math.floor(stepTicks));

    for (let i = 0; i < camPos.length - 1; i++) {
        const from = camPos[i];
        const to = camPos[i + 1];
        const tickDiff = to.tick - from.tick;

        // An "instant" cut point (see start-replay-camera.ts type 1) should stay a hard
        // cut rather than being smoothed through, so skip curve sampling for it.
        if (tickDiff <= 0 || to.instant) {
            waypoints.push({ position: from.position, rotation: camRot[i].rotation, tick: from.tick });
            continue;
        }

        const steps = Math.max(1, Math.round(tickDiff / step));

        const p0 = (camPos[i - 1] ?? from).position;
        const p1 = from.position;
        const p2 = to.position;
        const p3 = (camPos[i + 2] ?? to).position;

        const r0 = (camRot[i - 1] ?? camRot[i]).rotation;
        const r1 = camRot[i].rotation;
        const r2 = camRot[i + 1].rotation;
        const r3 = (camRot[i + 2] ?? camRot[i + 1]).rotation;

        for (let s = 0; s < steps; s++) {
            const t = s / steps;
            waypoints.push({
                position: catmullRomVec3(p0, p1, p2, p3, t),
                rotation: catmullRomRot(r0, r1, r2, r3, t),
                tick: Math.round(from.tick + t * tickDiff),
            });
        }
    }

    const lastIndex = camPos.length - 1;
    waypoints.push({ position: camPos[lastIndex].position, rotation: camRot[lastIndex].rotation, tick: camPos[lastIndex].tick });

    return waypoints;
}

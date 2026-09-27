# Detailed Changes: Add new camera mode

## File: generate-camera-curve.ts
### Status: NEW FILE

This is a new file that contains the Catmull-Rom spline

**Interfaces Added:**
```typescript
interface Vector3 { x: number; y: number; z: number; }
interface Rotation2D { x: number; y: number; }
interface CameraPoint { position: Vector3; tick: number; instant?: boolean; }
interface CameraRotation { rotation: Rotation2D; tick: number; }
interface Waypoint { position: Vector3; rotation: Rotation2D; tick: number; }
```

---

## File: start-replay-camera.ts
### Status: MODIFIED

### Change 1: Added Import
```typescript
// ADDED
import { generateCameraCurve } from "../camera/generate-camera-curve";
```

### Change 2: Type Annotations
```typescript
export function startReplayCam(player: Player, startPoint: number = 0)
```

### Change 3: EasingType Cast
```typescript
const ease = session.easeTypes[session.replayCamEase] as keyof typeof EasingType;
```

### Change 4: Non-null Assertions on Map Operations
```typescript
// BEFORE
session.cameraInitTimeoutsMap.get(player.id).push(timeOut1Id);
session.cameraTransitionTimeoutsMap.get(player.id).push(timeOut2Id);

// AFTER (ALL instances)
session.cameraInitTimeoutsMap.get(player.id)!.push(timeOut1Id);
session.cameraTransitionTimeoutsMap.get(player.id)!.push(timeOut2Id);
```

### Change 5: Added Type 5 Camera Mode
**Location:** Between Type 1 (Cinematic Cam) and Type 2 (Focus Cam) logic

```typescript
// NEW BLOCK (Type 5: Smooth Spline Cam)
if (session.settingCameraType === 5) {
    const camPosFromStart = camPos.slice(startPoint);
    const camRotFromStart = camRot.slice(startPoint);
    const stepTicks = session.curveStepTicks ?? 1;
    const waypoints = generateCameraCurve(camPosFromStart, camRotFromStart, stepTicks);
    
    const easeTime = (stepTicks / 20) * 1.15;
    
    waypoints.forEach((wp, index) => {
        const relativeTick = wp.tick - baseTick;
        const timeOutId = system.runTimeout(() => {
            player.camera.setCamera("minecraft:free", {
                location: wp.position,
                rotation: wp.rotation,
                ...(index === 0 ? {} : { easeOptions: { easeTime, easeType: EasingType[ease] } }),
            });
        }, relativeTick);
        session.cameraTransitionTimeoutsMap.get(player.id)!.push(timeOutId);
    });
}
```

## File: replay-settings.ts
### Status: MODIFIED

### Change 1: Updated Camera Type Dropdown
```typescript
// BEFORE (5 options)
.dropdown("rc1.dropdown.title.camera.type", 
    ["None (Free Cam)", "Cinematic Cam", "Focus Cam", 
     "Top-Down Focus (Fixed)", "Top-Down Focus (Dynamic)"], 
    { defaultValueIndex: session.settingCameraType })

// AFTER (6 options, new option at index 5)
.dropdown("rc1.dropdown.title.camera.type", 
    ["None (Free Cam)", "Cinematic Cam", "Focus Cam", 
     "Top-Down Focus (Fixed)", "Top-Down Focus (Dynamic)", 
     "Smooth Spline Cam"],  // NEW
    { defaultValueIndex: session.settingCameraType })
```

### Change 2: Added Curve Resolution Slider
```typescript
// ADDED (new line at end of form builder)
.slider("rc1.slider.title.curve.resolution", 1, 4, 
    { valueStep: 1, defaultValue: session.curveStepTicks })
```

### Change 3: Updated Form Value Parsing
```typescript
// BEFORE (form values end at index 8)
session.topDownCamHight = Number(response.formValues[8]);
// ... form closes

// AFTER (form values now go to index 9)
session.topDownCamHight = Number(response.formValues[8]);
session.curveStepTicks = Number(response.formValues[9]);  // NEW
// ... form closes
```

---

## File: create-session.ts
### Status: MODIFIED

### Change: Added curveStepTicks Property
```typescript
// BEFORE
settingCameraType: 1,
replayCamEase: 0,

// AFTER
settingCameraType: 1,
// 1 = one waypoint every tick (smoothest, most system.runTimeout calls),
// up to 4 = one waypoint every 4 ticks (cheaper, slightly less smooth).
curveStepTicks: 1,  // NEW
replayCamEase: 0,
```

---



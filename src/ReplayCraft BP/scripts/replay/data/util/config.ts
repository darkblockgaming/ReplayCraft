export default {
    // This flag controls the actions animations that are currently being developed.
    devAnimations: false,
    devChatCommands: true, // Enable development slash commands
    debugEnabled: true,
    debugEntityTracking: false, //Used for Ambient Entity Playback Logic (This is a busy flag!)
    debugEntityHurt: false, //Entity damage events are logged when enabled (This is a busy flag!)
    debugPlayerHurt: false, //PvP Hurt Data are logged when enabled.
    debugEntityPlayback: false,
    debugEntitySpawnEvents: false, //Entity Spawning events are logged when enabled (This is a busy flag!)
    debugItemUseEvents: false, //Item start use and release events are logged when enabled
    debugPlayerBreakBlockAfterEvent: false,
    debugPlayerBreakBlockBeforeEvent: false,
    debugPlayerInteractWithBlockAfterEvent: false,
    debugPlayerInteractWithBlockBeforeEvent: false,
    debugPlayerItemUseAfterEvent: false,
    debugPlayerLeaveAfterEvent: false,
    debugPlayerPlaceBlockAfterEvent: false,
    debugPlayerPlaceBlockBeforeEvent: false,
    debugTickData: false,
    debugEquipmentPlayback: false,
    debugEntityHurtPlayback: false,
    debugSafeSet: false,
    debugCameraUpdates: false,
    debugLogMemoryUsage: false,
    debugMounting: true,
};

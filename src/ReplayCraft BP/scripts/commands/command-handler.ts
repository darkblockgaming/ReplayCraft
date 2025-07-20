import { system, CustomCommand, CommandPermissionLevel, CustomCommandParamType, StartupEvent, CustomCommandResult, CustomCommandStatus, CustomCommandOrigin, Player } from "@minecraft/server";
import { givePlayerControls } from "./player commands/control-items";
import { playerSetSkin } from "./player commands/skin";
import { sessionManager } from "./admin commands/session-manager";
import { playerSetCameraPoint } from "./player commands/add-camera-point-cmd";
function init(event: StartupEvent) {
    const replaycraftControlsCommand: CustomCommand = {
        name: "rc:controls",
        description: "gives you the replaycraft controls items.",
        permissionLevel: CommandPermissionLevel.Any,
    };
    const replaycraftSkinCommand: CustomCommand = {
        name: "rc:skin",
        description: "Allows you to set your skin to be used in a replay.(Opens Skin UI)",
        permissionLevel: CommandPermissionLevel.Any,
    };
    const replaycraftAddCameraPointCommand: CustomCommand = {
        name: "rc:add",
        description: "Add a camera point.",
        permissionLevel: CommandPermissionLevel.Any,
    };
    const replaycraftSessionManagerCommand: CustomCommand = {
        name: "rc:sessions",
        description: "Opens the Session Manager.",
        permissionLevel: CommandPermissionLevel.GameDirectors,
    };

    /*
     * Register commands
     **/
    event.customCommandRegistry.registerCommand(replaycraftControlsCommand, givePlayerControls);
    event.customCommandRegistry.registerCommand(replaycraftSkinCommand, playerSetSkin);
    event.customCommandRegistry.registerCommand(replaycraftAddCameraPointCommand, playerSetCameraPoint);
    event.customCommandRegistry.registerCommand(replaycraftSessionManagerCommand, sessionManager);
}

// Subscribe to startup event to register commands
const customCommands = () => {
    system.beforeEvents.startup.subscribe(init);
};

export { customCommands };

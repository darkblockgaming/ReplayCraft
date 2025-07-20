import { system, CustomCommand, CommandPermissionLevel, CustomCommandParamType, StartupEvent, CustomCommandResult, CustomCommandStatus, CustomCommandOrigin, Player } from "@minecraft/server";
import { givePlayerControls } from "./player commands/control-items";
import { playerSetSkin } from "./player commands/skin";
function init(event: StartupEvent) {
    const replaycraftControlsCommand: CustomCommand = {
        name: "rc:controls",
        description: "gives you the replaycraft controls items.",
        permissionLevel: CommandPermissionLevel.Any,
    };
    const replaycraftSkingCommand: CustomCommand = {
        name: "rc:skin",
        description: "Allows you to set your skin to be used in a replay.(Opens Skin UI)",
        permissionLevel: CommandPermissionLevel.Any,
    };

    /*
     * Register commands
     **/
    event.customCommandRegistry.registerCommand(replaycraftControlsCommand, givePlayerControls);
    event.customCommandRegistry.registerCommand(replaycraftSkingCommand, playerSetSkin);
}

// Subscribe to startup event to register commands
const customCommands = () => {
    system.beforeEvents.startup.subscribe(init);
};

export { customCommands };

import { system, CustomCommand, CommandPermissionLevel, CustomCommandParamType, StartupEvent, CustomCommandResult, CustomCommandStatus, CustomCommandOrigin, Player } from "@minecraft/server";
import { givePlayerControls } from "./player commands/control-items";
function init(event: StartupEvent) {
    const replaycraftControlsCommand: CustomCommand = {
        name: "rc:controls",
        description: "gives you the replaycraft controls items.",
        permissionLevel: CommandPermissionLevel.Any,
    };

    /*
     * Register commands
     **/
    event.customCommandRegistry.registerCommand(replaycraftControlsCommand, givePlayerControls);
}

// Subscribe to startup event to register commands
const customCommands = () => {
    system.beforeEvents.startup.subscribe(init);
};

export { customCommands };

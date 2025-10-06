import { system, CustomCommand, CommandPermissionLevel, StartupEvent, CustomCommandParamType } from "@minecraft/server";
import { givePlayerControlsCmd } from "./player commands/control-items-cmd";
import { playerSetSkinCmd } from "./player commands/skin-cmd";
import { sessionManagerCmd } from "./admin commands/session-manager-cmd";
import { playerSetCameraPointCmd } from "./player commands/add-camera-point-cmd";
import config from "../data/util/config";
import { debugDatabaseUiCmd } from "./debug/database-ui-cmd";
import { debugPlayAnimationCmd } from "./debug/play-animation-cmd";
import { debugDatabaseConsoleCmd } from "./debug/database-list-cmd";
import { debugShowEntityComponentsCmd } from "./debug/debug-utils/show-entity-components";
import { debugPrintSessionCmd } from "./debug/print-session-data";
import { updatePlaybackHudCmd } from "./player commands/playback-hud-cmd";
import { playerPauseRecordingCmd } from "./player commands/recording-pause-cmd";
import { playerResumeRecordingCmd } from "./player commands/resume-recording-cmd";
import { debugUtilityCommand } from "./debug/debug-utlility";
function init(event: StartupEvent) {
    /*
     * Commands that have a Level set to Any means everyone can run this command, these are things accessible to all players.
     **/
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
    const replaycraftPauseRecordingCommand: CustomCommand = {
        name: "rc:pause",
        description: "Pause an active recording",
        permissionLevel: CommandPermissionLevel.Any,
    };
    const replaycraftResumeRecordingCommand: CustomCommand = {
        name: "rc:resume",
        description: "Resume's an active recording",
        permissionLevel: CommandPermissionLevel.Any,
    };
    /*
     * Commands that are GameDirectors means the player must have Operator Status, this based on testing
     * is the most compatible level to use across BDS, Realms and local words.
     **/
    const replaycraftSessionManagerCommand: CustomCommand = {
        name: "rc:sessions",
        description: "Opens the Session Manager.",
        permissionLevel: CommandPermissionLevel.GameDirectors,
    };
    /*
     * Debug Commands
     **/
    const replaycraftDatabaseUiCommand: CustomCommand = {
        name: "rc:database",
        description: "Opens the Database Manager.",
        permissionLevel: CommandPermissionLevel.GameDirectors,
    };
    const playAnimationCommand: CustomCommand = {
        name: "rc:playcustomanimation",
        description: "Playback a custom animation a replay entity will be spawend.",
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            { type: CustomCommandParamType.String, name: "Property Name" },
            { type: CustomCommandParamType.String, name: "Value" },
        ],
    };
    const replaycraftDatabaseCommand: CustomCommand = {
        name: "rc:listdatabase",
        description: "Prints the contents of a database to the server console",
        permissionLevel: CommandPermissionLevel.GameDirectors,
        optionalParameters: [{ type: CustomCommandParamType.String, name: "Database Name" }],
    };
    const replaycraftShowEntityComponetsCommand: CustomCommand = {
        name: "rc:showentitycomponets",
        description: "Shows requested entity components above near by entities.",
        permissionLevel: CommandPermissionLevel.GameDirectors,
        optionalParameters: [{ type: CustomCommandParamType.String, name: "Required Components." }],
    };
    const replaycraftPrintSessionDataCommand: CustomCommand = {
        name: "rc:printsessiondata",
        description: "Prints the sessions data to the console.",
        permissionLevel: CommandPermissionLevel.GameDirectors,
    };
    const replaycraftdebugMemory: CustomCommand = {
        name: "rc:debugmemory",
        description: "dev debug command to print memory usage to console.",
        permissionLevel: CommandPermissionLevel.GameDirectors,
    };
    const replaycraftUpdatePlaybackHudCommand: CustomCommand = {
        name: "rc:playbackhud",
        description: "enable or disable the playback HUD, and cycle through display modes.",
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [{ type: CustomCommandParamType.Boolean, name: "Enable" }],
        optionalParameters: [{ type: CustomCommandParamType.Integer, name: "element to use 0 for actionbar 1 for title." }],
    };
    /*
     * Register commands
     **/
    event.customCommandRegistry.registerCommand(replaycraftControlsCommand, givePlayerControlsCmd);
    event.customCommandRegistry.registerCommand(replaycraftSkinCommand, playerSetSkinCmd);
    event.customCommandRegistry.registerCommand(replaycraftAddCameraPointCommand, playerSetCameraPointCmd);
    event.customCommandRegistry.registerCommand(replaycraftSessionManagerCommand, sessionManagerCmd);
    event.customCommandRegistry.registerCommand(replaycraftUpdatePlaybackHudCommand, updatePlaybackHudCmd);
    event.customCommandRegistry.registerCommand(replaycraftPauseRecordingCommand, playerPauseRecordingCmd);
    event.customCommandRegistry.registerCommand(replaycraftResumeRecordingCommand, playerResumeRecordingCmd);
    if (config.devChatCommands) {
        event.customCommandRegistry.registerCommand(replaycraftDatabaseUiCommand, debugDatabaseUiCmd);
        event.customCommandRegistry.registerCommand(playAnimationCommand, debugPlayAnimationCmd);
        event.customCommandRegistry.registerCommand(replaycraftDatabaseCommand, debugDatabaseConsoleCmd);
        event.customCommandRegistry.registerCommand(replaycraftShowEntityComponetsCommand, debugShowEntityComponentsCmd);
        event.customCommandRegistry.registerCommand(replaycraftPrintSessionDataCommand, debugPrintSessionCmd);
        event.customCommandRegistry.registerCommand(replaycraftdebugMemory, debugUtilityCommand);
    }
}

// Subscribe to startup event to register commands
const customCommands = () => {
    system.beforeEvents.startup.subscribe(init);
};

export { customCommands };

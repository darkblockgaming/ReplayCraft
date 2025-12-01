import { CustomCommandOrigin, CustomCommandStatus, Player, system, world } from "@minecraft/server";

export function environmentCmd(_origin: CustomCommandOrigin, _daylight: boolean, _weather: boolean) {
    const player = _origin.sourceEntity as Player;
    system.run(() => {
        if (_daylight === true) {
            world.gameRules.doDayLightCycle = true;
        } else {
            world.gameRules.doDayLightCycle = false;
        }
        if (_weather === true) {
            world.gameRules.doWeatherCycle = true;
        } else {
            world.gameRules.doWeatherCycle = false;
        }
        world.sendMessage(`§4[ReplayCraft]§aEnvironment settings updated by ${player.name}: Daylight Cycle is now ${_daylight ? "enabled" : "disabled"}, Weather Cycle is now ${_weather ? "enabled" : "disabled"}.`);
    });
    return {
        status: CustomCommandStatus.Success,
        message: `executing...`,
    };
}

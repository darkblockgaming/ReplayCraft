import { CustomCommandOrigin, CustomCommandStatus, Player, system, world } from "@minecraft/server";
import { addCameraPoint } from "../../functions/camera/add-camera-point";
import { enableFlight } from "../../functions/player/survival";

export function flyCmd(_origin: CustomCommandOrigin) {
    system.run(() => {
        const entity = _origin.sourceEntity;
        const sender = entity as Player;

        if (world.isHardcore) {
            sender.sendMessage({
                //flight cannot be enabled in hardcore mode
                rawtext: [{ translate: "replaycraft.hardcore.mode.check" }],
            });
            //do the same as ceative mode you will need to get creative with blocks to get the right angle
            return addCameraPoint(sender);
        }
        //if the player is not in creative mode, and the world is not in hardcore mode, enable flight
        return enableFlight(sender);
    });
    return {
        status: CustomCommandStatus.Success,
        message: `flight mode enabled.`,
    };
}

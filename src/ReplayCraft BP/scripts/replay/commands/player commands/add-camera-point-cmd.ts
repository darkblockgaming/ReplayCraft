import { CustomCommandOrigin, CustomCommandStatus, GameMode, Player, system } from "@minecraft/server";
import { addCameraPoint } from "../../functions/camera/add-camera-point";

export function playerSetCameraPointCmd(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    system.run(() => {
        let gm = sender.getGameMode();
        if (gm === GameMode.Spectator && sender.hasTag("freecam")) {
            addCameraPoint(sender);
        }
    });
    return {
        status: CustomCommandStatus.Success,
        message: `executing...`,
    };
}

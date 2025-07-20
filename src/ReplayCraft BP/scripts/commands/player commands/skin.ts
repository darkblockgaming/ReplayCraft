import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { setSkin } from "../../ui/settings/set-skin";

export function playerSetSkin(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    system.run(() => {
        setSkin(sender);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Opening Skin UI.`,
    };
}

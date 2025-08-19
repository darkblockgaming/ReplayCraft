import { CustomCommandOrigin, CustomCommandStatus, Player, system } from "@minecraft/server";
import { showDatabaseListUI } from "../../ui/debug/db-size";

export function debugDatabaseUiCmd(_origin: CustomCommandOrigin) {
    const entity = _origin.sourceEntity;
    const sender = entity as Player;
    system.run(() => {
        showDatabaseListUI(sender);
    });

    return {
        status: CustomCommandStatus.Success,
        message: `Opening Database UI.`,
    };
}

import { CustomCommandOrigin, CustomCommandStatus, EntityInventoryComponent, ItemStack, Player, system } from "@minecraft/server";

export function givePlayerControls(_origin: CustomCommandOrigin) {
    system.run(() => {
        const entity = _origin.sourceEntity;
        const sender = entity as Player;
        const targetPlayerinv = sender.getComponent("inventory") as EntityInventoryComponent;
        const container = targetPlayerinv.container;
        const maxSlots = 36;

        // Find two free slots
        const freeSlots: number[] = [];
        for (let i = 0; i < maxSlots && freeSlots.length < 2; i++) {
            const item = container.getItem(i);
            if (!item?.typeId) {
                freeSlots.push(i);
            }
        }

        if (freeSlots.length < 2) {
            sender.sendMessage(`Not enough free slots!`);
        } else {
            const item1 = new ItemStack("minecraft:stick");
            item1.nameTag = "Replay";
            container.setItem(freeSlots[0], item1);

            const item2 = new ItemStack("minecraft:stick");
            item2.nameTag = "Cinematic";
            container.setItem(freeSlots[1], item2);

            sender.sendMessage({
                rawtext: [{ translate: "dbg.rc1.mes.thanks" }],
            });
        }
    });
    return {
        status: CustomCommandStatus.Success,
        message: `You have been give the custom items.`,
    };
}

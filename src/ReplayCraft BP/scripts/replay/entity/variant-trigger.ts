import { Entity } from "@minecraft/server";
import { RecordedEntityComponent } from "../classes/types/types";
import { debugError, debugLog } from "../data/util/debug";

const horseVariantEvents = [
    "minecraft:make_white", // 0
    "minecraft:make_creamy", // 1
    "minecraft:make_chestnut", // 2
    "minecraft:make_brown", // 3
    "minecraft:make_black", // 4
    "minecraft:make_gray", // 5
    "minecraft:make_darkbrown", // 6
];
// this will break compatibility with other packs that use custom horse files
/*
const horseMarkVariantEvents = [
    "dbg:give_markings_none", // 0
    "dbg:give_markings_white_details", // 1
    "dbg:give_markings_white_fields", // 2
    "dbg:give_markings_white_dots", // 3
    "dbg:give_markings_black_dots", // 4
];
**/
const villagerJobEvents = {
    armorer: "minecraft:become_armorer",
    butcher: "minecraft:become_butcher",
    cartographer: "minecraft:become_cartographer",
    cleric: "minecraft:become_cleric",
    farmer: "minecraft:become_farmer",
    fisherman: "minecraft:become_fisherman",
    fletcher: "minecraft:become_fletcher",
    leatherworker: "minecraft:become_leatherworker",
    librarian: "minecraft:become_librarian",
    stone_mason: "minecraft:become_mason",
    shepherd: "minecraft:become_sheperd", // Mojang typo
    toolsmith: "minecraft:become_toolsmith",
    weaponsmith: "minecraft:become_weaponsmith",
};
export function assignEntityComponents(entity: Entity, component: RecordedEntityComponent) {
    switch (component.typeId) {
        case "minecraft:color": {
            const spawnedEntityCompObject = entity.getComponent("minecraft:color");
            //@ts-ignore
            spawnedEntityCompObject.value = component.componentData.value;
            debugLog(`Restored minecraft:color for entity: ${entity.id}`);
            break;
        }

        case "minecraft:variant": {
            if (entity.typeId === "minecraft:horse") {
                const variantIndex = Number(component.componentData.value);
                const eventName = horseVariantEvents[variantIndex];

                if (eventName) {
                    entity.triggerEvent(eventName);
                    debugLog(`Restored minecraft:variant for horse: ${entity.id} -> ${eventName}`);
                } else {
                    debugError(`Invalid horse variant index: ${variantIndex}`);
                }
            }
            break;
        }
        case "minecraft:type_family": {
            if (entity.typeId === "minecraft:villager_v2") {
                const families = (component.componentData.families as string[]) || [];

                // Find the first family that matches a villager job
                const jobFamily = families.find((familyObject) => villagerJobEvents.hasOwnProperty(familyObject));

                if (jobFamily) {
                    const eventName = villagerJobEvents[jobFamily as keyof typeof villagerJobEvents];
                    entity.triggerEvent(eventName);
                    debugLog(`Restored villager job for entity: ${entity.id} -> ${eventName}`);
                } else {
                    debugLog(`No villager job found for entity: ${entity.id}`);
                }
            }
            break;
        }
    }
}

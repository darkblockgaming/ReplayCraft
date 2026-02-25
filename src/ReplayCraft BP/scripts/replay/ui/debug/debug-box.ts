import { world, system } from "@minecraft/server";
import { DebugBox, DebugText, debugDrawer } from "@minecraft/debug-utilities";

const debug = debugDrawer;
const MAX_DISTANCE = 16;
const debugViewers = new Set<string>(); // player.id
let debugEnabled = false;
let intervalId: number | undefined;

function getHitboxInfo(typeId: string) {
    // Visual approximations of Java hitboxes (Bedrock-safe)
    if (typeId.startsWith("minecraft:item")) return { height: 0.25, scale: 0.25 };
    if (typeId.includes("boat")) return { height: 0.6, scale: 1.2 };
    if (typeId.includes("minecart")) return { height: 0.7, scale: 1.2 };

    if (typeId.includes("player")) return { height: 1.8, scale: 1.8 };
    if (typeId.includes("zombie")) return { height: 1.8, scale: 1.8 };
    if (typeId.includes("skeleton")) return { height: 1.8, scale: 1.8 };
    if (typeId.includes("creeper")) return { height: 1.7, scale: 1.7 };
    if (typeId.includes("spider")) return { height: 0.9, scale: 1.4 };
    if (typeId.includes("cow")) return { height: 1.4, scale: 1.4 };
    if (typeId.includes("sheep")) return { height: 1.3, scale: 1.3 };

    return { height: 1.0, scale: 1.0 };
}

function drawDebugBoxes() {
    debug.removeAll();

    for (const player of world.getPlayers()) {
        if (!debugViewers.has(player.id)) continue;

        const nearbyEntities = player.dimension.getEntities({
            location: player.location,
            maxDistance: MAX_DISTANCE,
            excludeTypes: ["minecraft:player"],
        });

        for (const entity of nearbyEntities) {
            const info = getHitboxInfo(entity.typeId);

            const box = new DebugBox({
                x: 0,
                y: info.height / 2, // center on hitbox instead of feet
                z: 0,
            });

            box.attachedTo = entity;
            box.scale = info.scale;
            box.color = { red: 0, green: 255, blue: 0 };
            box.visibleTo = [player];

            debug.addShape(box);

            const text = new DebugText({ x: 0, y: info.height + 0.35, z: 0 }, entity.typeId);

            text.attachedTo = entity;
            text.color = { red: 255, green: 255, blue: 255 };
            text.visibleTo = [player];

            debug.addShape(text);
        }
    }
}

export function enable() {
    if (debugEnabled) return;
    debugEnabled = true;
    intervalId = system.runInterval(drawDebugBoxes, 5);
}

export function disable() {
    if (!debugEnabled) return;
    debugEnabled = false;

    if (intervalId !== undefined) {
        system.clearRun(intervalId);
        intervalId = undefined;
    }

    debug.removeAll();
}

export function toggle(sender?: any) {
    if (!sender?.id) return;

    if (debugViewers.has(sender.id)) {
        debugViewers.delete(sender.id);
        if (debugViewers.size === 0) {
            disable();
        }
    } else {
        debugViewers.add(sender.id);
        enable();
    }

    sender.sendMessage(`§e[Debug] Debug boxes are now §l${debugViewers.has(sender.id) ? "ENABLED" : "DISABLED"}§r§e.`);
}

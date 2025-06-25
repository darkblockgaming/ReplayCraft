import { world, system } from "@minecraft/server";
import { DebugBox, debugDrawer } from "@minecraft/debug-utilities";

const debug = debugDrawer;
const MAX_DISTANCE = 16;

let debugEnabled = false;
let intervalId: number | undefined;

function drawDebugBoxes() {
    debug.removeAll();

    for (const player of world.getPlayers()) {
        const playerLoc = player.location;

        const nearbyEntities = player.dimension.getEntities({
            location: playerLoc,
            maxDistance: MAX_DISTANCE,
            excludeTypes: ["minecraft:player"],
        });

        for (const entity of nearbyEntities) {
            const loc = entity.location;

            // Offset the box center left by 0.5 blocks on the X axis
            const offsetLocation = {
                x: loc.x - 0.5,
                y: loc.y,
                z: loc.z,
            };

            const box = new DebugBox(offsetLocation);
            box.color = { red: 0, green: 255, blue: 0 };

            debug.addShape(box);
        }
    }
}

export function enable() {
    if (debugEnabled) return;
    debugEnabled = true;

    intervalId = system.runInterval(() => {
        drawDebugBoxes();
    }, 5);
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
    if (debugEnabled) {
        disable();
    } else {
        enable();
    }

    sender?.sendMessage?.(`§e[Debug] Debug boxes are now §l${debugEnabled ? "ENABLED" : "DISABLED"}§r§e.`);
}

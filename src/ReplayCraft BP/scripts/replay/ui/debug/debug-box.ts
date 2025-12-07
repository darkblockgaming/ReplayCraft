import { world, system } from "@minecraft/server";
import { DebugBox, DebugText, debugDrawer } from "@minecraft/debug-utilities";

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

            // Draw green debug box
            const offsetLocation = { x: loc.x - 0.5, y: loc.y, z: loc.z };
            const box = new DebugBox(offsetLocation);
            box.color = { red: 0, green: 255, blue: 0 };
            debug.addShape(box);

            // Gather deep-cloned component data
            const components = entity.getComponents();
            let lineOffset = 0; // how high each line goes

            const wantedKeys = ["minecraft:skin_id"];

            for (const comp of components) {
                if (!wantedKeys.includes(comp.typeId)) continue;

                const componentData = deepCloneComponentData(comp) as Record<string, unknown>;

                let textLocation = {
                    x: loc.x,
                    y: loc.y + 2 + lineOffset * 0.25,
                    z: loc.z,
                };

                // Show header with component typeId
                const headerText = new DebugText(textLocation, comp.typeId);
                debug.addShape(headerText);
                lineOffset++;

                // Show the 'value' property specifically for minecraft:skin_id
                if (comp.typeId === "minecraft:skin_id" && "value" in componentData) {
                    const skinIdText = new DebugText({ x: loc.x, y: loc.y + 2 + lineOffset * 0.25, z: loc.z }, `value: ${componentData.value}`);
                    debug.addShape(skinIdText);
                    lineOffset++;
                }
            }
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
    if (debugEnabled) {
        disable();
    } else {
        enable();
    }
    sender?.sendMessage?.(`§e[Debug] Debug boxes are now §l${debugEnabled ? "ENABLED" : "DISABLED"}§r§e.`);
}

function deepCloneComponentData(obj: unknown, seen = new WeakSet<object>()): unknown {
    if (obj === null || typeof obj !== "object") return obj;

    if (seen.has(obj as object)) return undefined; // avoid circular references
    seen.add(obj as object);

    if (Array.isArray(obj)) {
        return obj.map((item) => deepCloneComponentData(item, seen));
    }

    const cloned: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
        const value = (obj as Record<string, unknown>)[key];
        if (typeof value !== "function") {
            try {
                cloned[key] = deepCloneComponentData(value, seen);
            } catch {
                // some properties may throw
            }
        }
    }
    return cloned;
}

import { world, system, CustomCommandOrigin, CustomCommandStatus } from "@minecraft/server";
import { DebugText, debugDrawer } from "@minecraft/debug-utilities";

const debug = debugDrawer;
const MAX_DISTANCE = 16;

let debugEnabled = false;
let intervalId: number | undefined;

function drawDebugText(requestedComponents: string[]) {
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
            let lineOffset = 0;

            for (const compId of requestedComponents) {
                try {
                    const comp = entity.getComponent(compId);
                    if (!comp) continue;

                    // Try to display the `.value` property if it exists
                    let displayValue: unknown;
                    if ("value" in comp) {
                        // @ts-ignore - property may exist at runtime
                        displayValue = comp.value;
                    } else {
                        // Fallback: just JSON stringify other props
                        displayValue = JSON.stringify(comp);
                    }

                    const valueText = new DebugText(
                        {
                            x: loc.x,
                            y: loc.y + 2 + lineOffset * 0.25,
                            z: loc.z,
                        },
                        `${compId}: \n${displayValue}`
                    );
                    debug.addShape(valueText);
                    lineOffset++;
                } catch (e) {
                    // If accessing throws, show error message in debug
                    const errorText = new DebugText(
                        {
                            x: loc.x,
                            y: loc.y + 2 + lineOffset * 0.25,
                            z: loc.z,
                        },
                        `${compId}: [error reading]`
                    );
                    debug.addShape(errorText);
                    lineOffset++;
                }
            }
        }
    }
}

export function debugShowEntityComponentsCmd(_origin: CustomCommandOrigin, requestedComponentsFromCmd: string) {
    if (debugEnabled) {
        debugEnabled = false;
        if (intervalId !== undefined) {
            system.clearRun(intervalId);
            intervalId = undefined;
        }
        debug.removeAll();
        return {
            status: CustomCommandStatus.Success,
            message: `Clearing Debug Text...`,
        };
    } else {
        debugEnabled = true;
        // Custom commands don't have an array type yet so we feed it as a string and split it based on a period

        let requestedComponents = requestedComponentsFromCmd
            .split(".")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        // Then call the script to execute.
        intervalId = system.runInterval(() => drawDebugText(requestedComponents), 5);
        return {
            status: CustomCommandStatus.Success,
            message: `Debug text enabled.`,
        };
    }
}

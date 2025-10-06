import { CustomCommandOrigin, CustomCommandStatus, system, world, Player } from "@minecraft/server";
import { collectRuntimeStats, collectPluginStats, RuntimeStats, PluginStats } from "@minecraft/debug-utilities";

const activeOverlays = new Set<string>(); // track player IDs who want live stats

export function debugUtilityCommand(origin: CustomCommandOrigin) {
    const player = origin.sourceEntity as Player;
    if (!player)
        return {
            status: CustomCommandStatus.Failure,
            message: "This command can only be run by a player.",
        };

    // Toggle overlay on/off
    if (activeOverlays.has(player.id)) {
        activeOverlays.delete(player.id);
        return {
            status: CustomCommandStatus.Success,
            message: "Memory overlay stopped.",
        };
    } else {
        activeOverlays.add(player.id);

        // Dump full stats once
        const runtime: RuntimeStats = collectRuntimeStats();
        const plugins: PluginStats = collectPluginStats();

        console.log("==== Runtime Stats Dump ====");
        for (const [key, value] of Object.entries(runtime)) {
            console.log(`${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`);
        }
        console.log("==== End Runtime Dump ====");

        console.log("==== Plugin Stats Dump ====");
        console.log(JSON.stringify(plugins, null, 2));
        console.log("==== End Plugin Dump ====");

        return {
            status: CustomCommandStatus.Success,
            message: "Memory overlay started. Use the command again to stop.",
        };
    }
}

// Live overlay update every second
system.runInterval(() => {
    if (activeOverlays.size === 0) return;

    const stats = collectRuntimeStats();
    const plugins = collectPluginStats();

    const usedMB = (stats.memoryUsedSize / 1024 / 1024).toFixed(2);
    const allocMB = (stats.memoryAllocatedSize / 1024 / 1024).toFixed(2);

    // Build summary string
    const summaryLines = [`§l=== Memory Summary ===`, `Mem Used: ${usedMB} MB`, `Mem Alloc: ${allocMB} MB`, `Objects: ${stats.objectCount}`, `Strings: ${stats.stringCount}`, `Functions: ${stats.functionCount}`, `§l=== Add-on Closures ===`];

    // Sort plugins by closure count descending
    const sortedPlugins = plugins.plugins
        .map((p) => ({
            name: p.name,
            closures: p.handleCounts["Scripting::ClosureType"] ?? 0,
        }))
        .sort((a, b) => b.closures - a.closures);

    for (const pack of sortedPlugins) {
        summaryLines.push(`${pack.name}: ${pack.closures}`);
    }

    const summary = summaryLines.join("\n");

    for (const player of world.getPlayers()) {
        if (activeOverlays.has(player.id)) {
            player.onScreenDisplay.setActionBar(summary);
        }
    }
}, 20); // 20 ticks = ~1 second

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import os from "os";
import fse from "fs-extra";
import { glob } from "glob";

// Array to store all spawned child processes
const spawnedProcesses = [];

// Function to get the latest "bedrock-server-*" directory
function getLatestBedrockServerDir() {
    return glob.sync("bedrock-server-*")[0];
}

async function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, {
            stdio: "inherit", // Inherit stdio to display output in the terminal
        });

        process.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        process.on("error", (err) => {
            reject(new Error(`Failed to start process: ${err.message}`));
        });
    });
}

async function checkAndBuild() {
    // Clean up the 'build/' directory
    const cleanBuildDir = "build";
    if (fs.existsSync(cleanBuildDir)) {
        fse.removeSync(cleanBuildDir);
        console.log("> Cleaned up the 'build/' directory...\n");
    }

    // Use the function to get the latest directory
    let bedrockServerDir = getLatestBedrockServerDir();

    if (!bedrockServerDir) {
        console.error("> Bedrock server directory not found...\n");
        // Execute your BDS script here
        const bdsProcess = spawn("node", ["bin/bds.js"], {
            stdio: "inherit",
        });
        spawnedProcesses.push(bdsProcess); // Add to the array

        await new Promise((resolve, reject) => {
            bdsProcess.on("close", (code) => {
                if (code === 0) {
                    bedrockServerDir = glob.sync("bedrock-server-*")[0];
                    console.log("\n> Bedrock server set up successfully...\n");
                    resolve();
                } else {
                    console.error("   - Error while setting up the Bedrock server.");
                    reject(`BDS setup failed with code ${code}`);
                }
            });
        });
    }

    if (bedrockServerDir) {
        // Remove the ".zip" extension from the directory name if it exists
        bedrockServerDir = bedrockServerDir.replace(/\.zip$/, "");
    } else {
        console.error("> Bedrock server directory not found...\n");
        return;
    }

    // Check if the 'worlds' folder exists, and if not, create it
    const worldsDir = path.join(bedrockServerDir, "worlds");
    if (!fs.existsSync(worldsDir)) {
        console.log("> Creating 'worlds' directory...\n");
        fs.mkdirSync(worldsDir, { recursive: true });
    }

    // Check if the 'Bedrock level' subfolder exists in 'worlds'
    const testWorldDir = path.join(worldsDir, "Bedrock level");
    if (!fs.existsSync(testWorldDir)) {
        console.log("> Creating 'Bedrock level' directory...\n");
        fs.mkdirSync(testWorldDir); // Create the 'Bedrock level' subfolder
        fse.copySync("new-world-beta-api", testWorldDir); // Copy 'new-world-beta-api' to the 'Bedrock level' subfolder
    }

    // Define the BeatBox directory for behavior and resource packs
    const beatBoxBehaviorDir = path.join(testWorldDir, "behavior_packs", "BeatBox");
    const beatBoxResourceDir = path.join(testWorldDir, "resource_packs", "BeatBox");

    // Check if the behavior packs directory exists, create it if it doesn't
    if (!fs.existsSync(path.dirname(beatBoxBehaviorDir))) {
        console.log("> Creating 'behavior_packs/BeatBox' directory...\n");
        fs.mkdirSync(path.dirname(beatBoxBehaviorDir), { recursive: true });
    }

    // Check if the resource packs directory exists, create it if it doesn't
    if (!fs.existsSync(path.dirname(beatBoxResourceDir))) {
        console.log("> Creating 'resource_packs/BeatBox' directory...\n");
        fs.mkdirSync(path.dirname(beatBoxResourceDir), { recursive: true });
    }

    // Clean up the 'BeatBox' directory for behavior packs if it exists
    if (fs.existsSync(beatBoxBehaviorDir)) {
        fse.removeSync(beatBoxBehaviorDir);
        console.log(`> Cleaned up the '${beatBoxBehaviorDir}' directory...\n`);
    }

    // Clean up the 'BeatBox' directory for resource packs if it exists
    if (fs.existsSync(beatBoxResourceDir)) {
        fse.removeSync(beatBoxResourceDir);
        console.log(`> Cleaned up the '${beatBoxResourceDir}' directory...\n`);
    }

    // Create the BeatBox directory again for behavior and resource packs
    console.log("> Creating the 'BeatBox' directory for behavior packs...\n");
    fs.mkdirSync(beatBoxBehaviorDir, { recursive: true });
    console.log("> Creating the 'BeatBox' directory for resource packs...\n");
    fs.mkdirSync(beatBoxResourceDir, { recursive: true });

    // Commands for building packages
    const firstCommand = "node";
    const firstArgs = ["bin/build-package.js", "--server"];

    try {
        // Run the first build command
        await runCommand(firstCommand, firstArgs);
    } catch (error) {
        console.error("Error executing build commands:", error.message);
        process.exit(1); // Abort immediately if any command fails
    }

    // Copy the build contents to BeatBox behavior pack directory
    const buildDir = "build";
    fse.copySync(buildDir, beatBoxBehaviorDir);
    // Copy resource pack files to the BeatBox resource pack directory
    const buildResourceDir = path.join(`./`, "BlockBeats_RP");
    fse.copySync(buildResourceDir, beatBoxResourceDir);

    console.log(`> Copied build contents to '${beatBoxBehaviorDir}' and '${beatBoxResourceDir}'...\n`);

    // Read and parse manifest.json for behavior packs
    const manifestPath = path.join(beatBoxBehaviorDir, "manifest.json");
    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

        // Update world_behavior_packs.json for behavior packs
        const worldBehaviorPacksPath = path.join(testWorldDir, "world_behavior_packs.json");
        if (fs.existsSync(worldBehaviorPacksPath)) {
            const worldBehaviorPacks = [
                {
                    pack_id: manifest.header.uuid,
                    version: manifest.header.version,
                },
            ];

            fs.writeFileSync(worldBehaviorPacksPath, JSON.stringify(worldBehaviorPacks, null, 2));
        }

        // If there's a manifest.json for resource packs, handle it similarly
        const resourceManifestPath = path.join(beatBoxResourceDir, "manifest.json");
        console.log(resourceManifestPath);
        if (fs.existsSync(resourceManifestPath)) {
            const resourceManifest = JSON.parse(fs.readFileSync(resourceManifestPath, "utf8"));

            // Update world_resource_packs.json for resource packs
            const worldResourcePacksPath = path.join(testWorldDir, "world_resource_packs.json");
            if (fs.existsSync(worldResourcePacksPath)) {
                const worldResourcePacks = [
                    {
                        pack_id: resourceManifest.header.uuid,
                        version: resourceManifest.header.version,
                    },
                ];

                fs.writeFileSync(worldResourcePacksPath, JSON.stringify(worldResourcePacks, null, 2));
            }
        }
    }

    console.log("> Test build completed...\n");

    const serverPath = path.resolve(bedrockServerDir, "bedrock_server");

    if (os.type() === "Linux") {
        const sudoCommand = `LD_LIBRARY_PATH=. ${serverPath}`;
        const chmodProcess = spawn("chmod", ["+x", serverPath], { cwd: bedrockServerDir });

        chmodProcess.on("close", (chmodCode) => {
            if (chmodCode === 0) {
                const serverProcess = spawn("sh", ["-c", `sudo ${sudoCommand}`], {
                    stdio: "inherit",
                    cwd: bedrockServerDir,
                });
                spawnedProcesses.push(serverProcess);

                serverProcess.on("exit", (code) => {
                    console.log(`\n   - Server exited with code ${code}. Killing all spawned processes...`);
                    spawnedProcesses.forEach((child) => child.kill());
                    process.exit(1);
                });
            } else {
                console.error("   - Error setting execute permission for bedrock_server.");
                process.exit(1); // Abort immediately if error occurs
            }
        });
    } else if (os.type() === "Windows_NT") {
        const serverProcess = spawn("cmd", ["/c", serverPath], {
            stdio: "inherit",
            cwd: bedrockServerDir,
        });
        spawnedProcesses.push(serverProcess);

        serverProcess.on("exit", (code) => {
            console.log(`\n   - Server exited with code ${code}. Killing all spawned processes...`);
            spawnedProcesses.forEach((child) => child.kill());
            process.exit(1);
        });
    } else {
        console.error("   - Unsupported OS: " + os.type());
        process.exit(1); // Abort immediately if unsupported OS
    }
}

checkAndBuild().catch((err) => {
    console.error("Error during the build process:", err);
    process.exit(1); // Abort immediately on any failure
});

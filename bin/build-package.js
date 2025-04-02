import path from "path";
import fs from "fs-extra";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { path7za } from "7zip-bin";
import AdmZip from "adm-zip"; // Import adm-zip for modifying zip files

// Constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = fs.readJsonSync("package.json");
const packageVersion = packageJson.version;
const assets = ["CHANGELOG.md", "LICENSE", "manifest.json", "pack_icon.png", "README.md"];

// Function to run a command and handle errors
function runCommand(command, args) {
    const result = spawnSync(command, args, { stdio: "inherit" });
    if (result.status !== 0) {
        console.error(`${command} failed with code ${result.status}:`);
        if (result.stderr && result.stderr.length > 0) {
            console.error(result.stderr.toString());
        } else if (result.stdout && result.stdout.length > 0) {
            console.error(result.stdout.toString());
        }
        process.exit(1); // Exit immediately if the command fails
    }
    return result;
}

// Function to copy assets to the build directory
function copyAssets() {
    console.log("Copying assets");
    assets.forEach((asset) => {
        fs.copyFileSync(asset, path.join("build", asset));
    });
}

// Function to build project using TypeScript
function buildProject() {
    console.log("Building the project");
    const tsConfigPath = path.resolve("./tsconfig.json");
    runCommand("node", ["./node_modules/typescript/bin/tsc", "-p", tsConfigPath]);
    fs.copySync("src/blocks", path.join("build", "blocks"));
    fs.copySync("src/recipes", path.join("build", "recipes"));
}

// Function to create the directory structure for the .mcaddon file
function createAddonStructure() {
    const addonDir = path.join("build", "addon");
    fs.mkdirSync(addonDir, { recursive: true });

    const behaviorPacksDir = path.join(addonDir, "behavior_packs");
    fs.mkdirSync(behaviorPacksDir, { recursive: true });

    // Copy resource packs and behavior packs
    fs.copySync("ReplayCraft RP", path.join(addonDir, "resource_packs"));
    return behaviorPacksDir;
}

// Function to copy scripts, blocks and recipes
function copyScriptsAndBlocks(behaviorPacksDir) {
    const scriptsDir = path.join("build", "scripts");
    if (fs.existsSync(scriptsDir)) {
        console.log("Copying scripts directory...");
        fs.copySync(scriptsDir, path.join(behaviorPacksDir, "scripts"));
    }

    const blockDir = path.join("build", "blocks");
    if (fs.existsSync(blockDir)) {
        console.log("Copying blocks directory...");
        fs.copySync(blockDir, path.join(behaviorPacksDir, "blocks"));
    }
    const recipesDir = path.join("build", "recipes");
    if (fs.existsSync(recipesDir)) {
        console.log("Copying recipes directory...");
        fs.copySync(recipesDir, path.join(behaviorPacksDir, "recipes"));
    }

    console.log("Copying assets to behavior_packs...");
    assets.forEach((asset) => {
        fs.copyFileSync(path.join("build", asset), path.join(behaviorPacksDir, asset));
    });
}

// Function to create a distribution archive
function createDistributionArchive(outputFilePath, addonDir) {
    console.log("Creating distribution archive file");

    // Delete existing archive if it exists
    if (fs.existsSync(outputFilePath)) {
        console.log(`Removing existing archive: ${outputFilePath}`);
        fs.unlinkSync(outputFilePath);
    }

    // Run the 7z command to create the archive
    const sevenZipPath = path7za;
    const result = runCommand(sevenZipPath, ["a", `-tzip`, outputFilePath, "build/addon/resource_packs", "build/addon/behavior_packs"], { cwd: addonDir });

    // Check for system-level error
    if (result.error) {
        console.error(`Error while creating distribution archive: ${result.error.message}`);
        process.exit(1); // Exit the process for system-level errors
    }

    console.log("Archive created successfully!");
}

// Function to modify the .mcaddon file by removing the addon directory
function modifyZip(outputFilePath, addonDir) {
    console.log("Modifying the .zip file to remove 'addon' directory but keep contents...");
    const zip = new AdmZip(outputFilePath);
    const zipEntries = zip.getEntries(); // Get all entries in the zip

    // Filter out entries that are inside the 'addon' directory (resource_packs and behavior_packs)
    const filteredEntries = zipEntries.filter((entry) => {
        return entry.entryName.startsWith("build/addon/") && !entry.entryName.startsWith("build/addon/resource_packs/") && !entry.entryName.startsWith("build/addon/behavior_packs/");
    });

    // Create a new zip file excluding the 'addon' directory itself
    const newZip = new AdmZip();
    filteredEntries.forEach((entry) => {
        newZip.addFile(entry.entryName, entry.getData()); // Add the filtered entries to the new zip
    });

    // Now, add the 'resource_packs' and 'behavior_packs' folders directly (without the parent 'addon' directory)
    newZip.addLocalFolder(path.join(addonDir, "resource_packs"), "resource_packs");
    newZip.addLocalFolder(path.join(addonDir, "behavior_packs"), "behavior_packs");

    // Save the modified zip file
    newZip.writeZip(outputFilePath);
    console.log(`Modified Archive file successfully: ${outputFilePath}`);
}

// Function to clean up after the build process
function cleanUp(addonDir) {
    console.log("Cleaning up addon directory...");
    fs.removeSync(addonDir); // Remove the addon directory
    console.log("Addon directory cleaned up.");
}

(async () => {
    // Clean build directory
    console.log("Cleaning build directory");
    fs.removeSync("build");

    // Create necessary directories
    console.log("Creating build directory");
    fs.mkdirSync("build", { recursive: true });

    // Copy assets and build project
    copyAssets();
    buildProject();

    // Check if --server parameter is present
    const isServerMode = process.argv.includes("--server");

    if (!isServerMode) {
        // Create the addon structure and copy files
        const behaviorPacksDir = createAddonStructure();
        copyScriptsAndBlocks(behaviorPacksDir);

        // Prepare output file path
        const outputFileName = `BlockBeats-v${packageVersion}.${process.argv.includes("--mcpack") ? "mcaddon" : "zip"}`;
        const outputFilePath = path.resolve("build/build", outputFileName);

        // Create the distribution archive
        createDistributionArchive(outputFilePath, "build/addon");

        // Modify the zip file to remove the 'addon' directory but keep contents
        modifyZip(outputFilePath, "build/addon");

        // Clean up the addon directory
        cleanUp("build/addon");
    }

    console.log("Build process completed successfully.");
})();

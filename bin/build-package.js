import path from "path";
import fs from "fs-extra";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { path7za } from "7zip-bin";
import AdmZip from "adm-zip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const buildInfoPath = path.join(projectRoot, "build-info.json");
const manifestPath = path.join(projectRoot, "manifest.json");
const resourceManifestPath = path.join(projectRoot, "ReplayCraft RP", "manifest.json");

const buildDir = path.join(projectRoot, "build");
const addonDir = path.join(buildDir, "addon");
const behaviorPacksDir = path.join(addonDir, "ReplayCraft_BP");
const assets = ["CHANGELOG.md", "LICENSE", "manifest.json", "pack_icon.png", "README.md"];

function runCommand(command, args) {
    const result = spawnSync(command, args, { stdio: "inherit" });
    if (result.status !== 0) {
        console.error(`${command} failed with code ${result.status}`);
        process.exit(1);
    }
}

function getAndUpdateBuildNumber() {
    const buildInfo = fs.existsSync(buildInfoPath) ? fs.readJsonSync(buildInfoPath) : { build: 0 };

    buildInfo.build += 1;
    fs.writeJsonSync(buildInfoPath, buildInfo, { spaces: 2 });

    return buildInfo.build;
}

function updateManifestNames(buildNumber, isDevMode) {
    const manifest = fs.readJsonSync(manifestPath);
    const resourceManifest = fs.readJsonSync(resourceManifestPath);
    const version = manifest.header.version.join(".");

    if (isDevMode) {
        manifest.header.name = `ReplayCraft BP v${version}-Dev Build ${buildNumber}`;
        resourceManifest.header.name = `ReplayCraft RP v${version}-Dev Build ${buildNumber}`;
    }

    fs.writeJsonSync(path.join(buildDir, "manifest.json"), manifest, { spaces: 2 });
    fs.writeJsonSync(resourceManifestPath, resourceManifest, { spaces: 2 });
}

function buildProject() {
    const tsConfigPath = path.resolve(projectRoot, "tsconfig.json");
    runCommand("node", ["./node_modules/typescript/bin/tsc", "-p", tsConfigPath]);

    fs.copySync(path.join(projectRoot, "src", "entities"), path.join(buildDir, "entities"));
    fs.copySync(path.join(projectRoot, "src", "functions"), path.join(buildDir, "functions"));
}

function copyAssets() {
    assets.forEach((asset) => {
        fs.copyFileSync(path.join(projectRoot, asset), path.join(buildDir, asset));
    });
}

function createAddonStructure() {
    fs.mkdirSync(behaviorPacksDir, { recursive: true });
    fs.copySync(path.join(projectRoot, "ReplayCraft RP"), path.join(addonDir, "ReplayCraft_RP"));
}

function copyScriptsAndBlocks() {
    const scriptsDir = path.join(buildDir, "scripts");
    if (fs.existsSync(scriptsDir)) {
        fs.copySync(scriptsDir, path.join(behaviorPacksDir, "scripts"));
    }
    ["entities", "functions"].forEach((dir) => {
        const fullPath = path.join(buildDir, dir);
        if (fs.existsSync(fullPath)) {
            fs.copySync(fullPath, path.join(behaviorPacksDir, dir));
        }
    });

    assets.forEach((asset) => {
        fs.copyFileSync(path.join(buildDir, asset), path.join(behaviorPacksDir, asset));
    });
}

function createDistributionArchive(outputFilePath) {
    runCommand(path7za, ["a", "-tzip", outputFilePath, "build/addon/ReplayCraft_RP", "build/addon/ReplayCraft_BP"]);
}

function modifyZip(outputFilePath) {
    const zip = new AdmZip(outputFilePath);
    const newZip = new AdmZip();

    zip.getEntries().forEach((entry) => {
        if (!entry.entryName.startsWith("build/addon/")) return;
        const newPath = entry.entryName.replace("build/addon/", "");
        newZip.addFile(newPath, entry.getData());
    });

    newZip.writeZip(outputFilePath);
}

function cleanUp() {
    fs.removeSync(addonDir);
}

(async () => {
    console.log("Cleaning build directory");
    fs.removeSync(buildDir);
    fs.mkdirSync(buildDir, { recursive: true });

    const buildNumber = getAndUpdateBuildNumber();
    copyAssets();
    buildProject();

    const isDevMode = process.argv.includes("--dev");
    const isDistMode = process.argv.includes("--mcaddon");
    const isServerMode = process.argv.includes("--server");

    const manifest = fs.readJsonSync(manifestPath);
    const version = manifest.header.version.join(".");

    if (isDevMode) {
        updateManifestNames(buildNumber, true);
    }

    if (!isServerMode) {
        createAddonStructure();
        copyScriptsAndBlocks();

        const outputFileName = isDevMode ? `ReplayCraft-v${version}-Dev-${buildNumber}.mcaddon` : `ReplayCraft-v${version}.mcaddon`;

        const outputFilePath = path.resolve(buildDir, "build", outputFileName);
        fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

        createDistributionArchive(outputFilePath);
        modifyZip(outputFilePath);
        cleanUp();
    }

    console.log(`Build ${buildNumber} completed successfully.`);
})();

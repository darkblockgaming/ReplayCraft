import path from "path";
import fs from "fs-extra";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { path7za } from "7zip-bin";
import AdmZip from "adm-zip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const buildInfoPath = path.join(projectRoot, "build-info.json");

// Updated paths to reflect new location inside `src`
const bpSourcePath = path.join(projectRoot, "src", "ReplayCraft BP");
const rpSourcePath = path.join(projectRoot, "src", "ReplayCraft RP");

const bpManifestPath = path.join(bpSourcePath, "manifest.json");
const rpManifestPath = path.join(rpSourcePath, "manifest.json");

const buildDir = path.join(projectRoot, "build");
const addonDir = path.join(buildDir, "addon");
const behaviorPacksDir = path.join(addonDir, "ReplayCraft_BP");

// These are still in the project root
const projectDocs = ["CHANGELOG.md", "LICENSE", "README.md"];

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

function createAddonStructure() {
    fs.mkdirSync(addonDir, { recursive: true });

    // Copy RP folder as-is
    fs.copySync(rpSourcePath, path.join(addonDir, "ReplayCraft_RP"));

    // Copy BP folder but exclude the scripts folder (to avoid raw .ts files)
    fs.copySync(bpSourcePath, path.join(addonDir, "ReplayCraft_BP"), {
        filter: (src) => {
            // Skip the scripts folder
            if (src.includes(path.join("ReplayCraft BP", "scripts"))) {
                return false;
            }
            return true;
        },
    });
}

function updateManifestNames(buildNumber, isDevMode) {
    const manifest = fs.readJsonSync(bpManifestPath);
    const resourceManifest = fs.readJsonSync(rpManifestPath);
    const version = manifest.header.version.join(".");

    if (isDevMode) {
        manifest.header.name = `ReplayCraft BP v${version}-Dev Build ${buildNumber}`;
        resourceManifest.header.name = `ReplayCraft RP v${version}-Dev Build ${buildNumber}`;
    }

    fs.writeJsonSync(bpManifestPath, manifest, { spaces: 2 });
    fs.writeJsonSync(rpManifestPath, resourceManifest, { spaces: 2 });
}

function buildProject() {
    const tsConfigPath = path.resolve(projectRoot, "tsconfig.json");
    runCommand("node", ["./node_modules/typescript/bin/tsc", "-p", tsConfigPath]);
}

function copyProjectDocs() {
    const bpDest = path.join(addonDir, "ReplayCraft_BP");
    const rpDest = path.join(addonDir, "ReplayCraft_RP");

    projectDocs.forEach((projectDoc) => {
        const sourcePath = path.join(projectRoot, projectDoc);
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, path.join(bpDest, projectDoc));
            fs.copyFileSync(sourcePath, path.join(rpDest, projectDoc));
        }
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

    const isDevMode = process.argv.includes("--dev");
    const isDistMode = process.argv.includes("--mcaddon");
    const isServerMode = process.argv.includes("--server");

    const manifest = fs.readJsonSync(bpManifestPath);
    const version = manifest.header.version.join(".");

    if (isDevMode) {
        updateManifestNames(buildNumber, true);
    }

    if (!isServerMode) {
        createAddonStructure();
        copyProjectDocs();
        buildProject();
        const outputFileName = isDevMode ? `ReplayCraft-v${version}-Dev-${buildNumber}.mcaddon` : `ReplayCraft-v${version}.mcaddon`;

        const outputFilePath = path.resolve(buildDir, "build", outputFileName);
        fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

        createDistributionArchive(outputFilePath);
        modifyZip(outputFilePath);
        //cleanUp();
    }

    console.log(`Build ${buildNumber} completed successfully.`);
})();

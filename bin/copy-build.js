import path from "path";
import fs from "fs";
import fse from "fs-extra";

const appDataPath = process.env.APPDATA;

const isPreview = false;

const mcType = isPreview ? "Minecraft Bedrock Preview" : "Minecraft Bedrock";

const mcPath = path.join(appDataPath, mcType, "Users", "Shared", "games", "com.mojang");

const devBP = path.join(mcPath, "development_behavior_packs", "ReplayCraft_BP");
const devRP = path.join(mcPath, "development_resource_packs", "ReplayCraft_RP");

const buildBP = path.join(`./`, "build", "addon", "ReplayCraft_BP");
const buildRP = path.join(`./`, "build", "addon", "ReplayCraft_RP");

function transferPack(buildPath, devPath) {
    if (fs.existsSync(devPath)) {
        fse.removeSync(devPath);
        console.log(`🩹 Cleared existing: ${devPath}`);
    }
    fse.copySync(buildPath, devPath);
    console.log(`📦 Copied ${path.basename(buildPath)} to Minecraft dev folder.`);
}

function transferToMinecraft() {
    try {
        fse.ensureDirSync(path.dirname(devBP));
        fse.ensureDirSync(path.dirname(devRP));

        transferPack(buildBP, devBP);
        transferPack(buildRP, devRP);

        console.log("✅ Transfer to Minecraft dev folders complete.");
    } catch (err) {
        console.error("❌ Transfer failed:", err);
    }
}

transferToMinecraft();

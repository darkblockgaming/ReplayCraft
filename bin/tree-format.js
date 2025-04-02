import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const kebabCasePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pascalCasePattern = /^[A-Z][a-zA-Z0-9]*$/;

// List of file extensions to ignore (e.g., package.json, package-lock.json, .md, .json files, etc.)
const ignoreFileExtensions = new Set([".json", ".md"]);
// List of files to explicitly ignore (e.g., package.json, package-lock.json)
const ignoreFiles = new Set(["package.json", "package-lock.json"]);
// List of directories to ignore (e.g., node_modules)
const ignoreDirs = new Set(["node_modules", "dist", "build"]);

function toPascalCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => (index === 0 ? match.toUpperCase() : match.toUpperCase())).replace(/\s+/g, "");
}

function containsClassDefinition(filePath) {
    // Read the file content and check for any class declarations
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return /\bclass\s+[A-Z][a-zA-Z0-9]*\b/.test(fileContent);
}

function checkNamingConventions(directory, depth = 0) {
    const items = fs.readdirSync(directory);
    let hasDiscrepancies = false;

    items.forEach((item) => {
        const fullPath = path.join(directory, item);
        const isDirectory = fs.statSync(fullPath).isDirectory();

        // Skip specific files and directories that don't need naming checks
        if (ignoreFiles.has(item)) {
            console.log(`${"│   ".repeat(depth)}└── ${chalk.gray(item)} ${chalk.gray("(Ignored: Configuration file)")}`);
            return;
        }

        // Skip files with extensions that are generally not part of source code
        const fileExtension = path.extname(item);
        if (ignoreFileExtensions.has(fileExtension)) {
            console.log(`${"│   ".repeat(depth)}└── ${chalk.gray(item)} ${chalk.gray("(Ignored: Non-source file extension)")}`);
            return;
        }

        // Skip directories listed in the ignoreDirs set
        if (ignoreDirs.has(item)) {
            console.log(`${"│   ".repeat(depth)}└── ${chalk.gray(item)} ${chalk.gray("(Ignored: Directory)")}`);
            return;
        }

        const indentation = "│   ".repeat(depth);
        const treeBranch = isDirectory ? "├── " : "└── ";

        if (isDirectory) {
            console.log(`${indentation}${treeBranch}${chalk.blue(item)}`);
            const result = checkNamingConventions(fullPath, depth + 1);
            hasDiscrepancies = hasDiscrepancies || result;
        } else {
            const fileNameWithoutExtension = path.basename(item, fileExtension);

            const isKebabCase = kebabCasePattern.test(fileNameWithoutExtension);
            const isPascalCase = pascalCasePattern.test(toPascalCase(fileNameWithoutExtension.replace(/-([a-z])/g, (g) => g[1].toUpperCase())));

            if (fileExtension === ".ts" || fileExtension === ".js") {
                if (!isKebabCase) {
                    console.log(`${indentation}${treeBranch}${chalk.red(item)} ${chalk.red("(Error: Does not follow kebab-case)")}`);
                    console.log(`${indentation}    ${chalk.yellow("Reason:")} The file name "${chalk.red(fileNameWithoutExtension)}" should be in kebab-case (e.g., "${chalk.green("command-handler.ts")}").`);
                    hasDiscrepancies = true;
                } else {
                    console.log(`${indentation}${treeBranch}${chalk.green(item)}`);
                }

                if (fileExtension === ".ts" && containsClassDefinition(fullPath)) {
                    const className = toPascalCase(fileNameWithoutExtension.replace(/-([a-z])/g, (g) => g[1].toUpperCase()));
                    if (!isPascalCase && fileNameWithoutExtension !== "index") {
                        console.log(`${indentation}${treeBranch}${chalk.red(className)} ${chalk.red("(Error: Does not follow PascalCase)")}`);
                        console.log(`${indentation}    ${chalk.yellow("Reason:")} Class names should be in PascalCase (e.g., "${chalk.green("CommandHandler")}").`);
                        hasDiscrepancies = true;
                    }
                }
            } else {
                console.log(`${indentation}${treeBranch}${chalk.yellow(item)} ${chalk.yellow("(Warning: Unexpected file extension)")}`);
            }
        }
    });

    return hasDiscrepancies;
}

// Run the check on the src directory
const discrepancies = checkNamingConventions(path.join("./src"));
if (discrepancies) {
    process.exit(1); // Exit with an error code if discrepancies are found
} else {
    process.exit(0); // Exit with success code if no discrepancies are found
}

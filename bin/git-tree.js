import { exec } from "child_process";
import chalk from "chalk";

// Execute Git command to list repository files
exec("git ls-tree -r --name-only HEAD", (err, stdout, stderr) => {
    if (err) {
        console.error(chalk.red(`Error executing Git command: ${stderr}`));
        process.exit(1);
    }

    const files = stdout.split("\n").filter((line) => line.trim() !== "");

    const tree = {};
    files.forEach((file) => {
        const parts = file.split("/");
        parts.reduce((acc, part, index) => {
            if (!acc[part]) {
                acc[part] = index === parts.length - 1 ? null : {};
            }
            return acc[part];
        }, tree);
    });

    function printTree(node, prefix = "") {
        Object.keys(node).forEach((key, index, array) => {
            const isLast = index === array.length - 1;
            const branch = isLast ? "└── " : "├── ";
            const newPrefix = isLast ? `${prefix}    ` : `${prefix}│   `;

            // Style folders and files differently
            const styledKey = node[key] ? chalk.blue.bold(key) : chalk.green(key);
            console.log(`${prefix}${branch}${styledKey}`);

            if (node[key]) {
                printTree(node[key], newPrefix);
            }
        });
    }

    console.log(chalk.cyan("Git Repository Tree:"));
    printTree(tree);
});

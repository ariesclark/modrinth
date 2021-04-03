import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

import pluralize from "pluralize";
import {diff, diffString} from "json-diff";

const toPascalCase = (string) => {
    return string.split("/")
        .map(snake => snake.split("_")
            .map(substr => substr.charAt(0)
                .toUpperCase() +
                substr.slice(1))
            .join(""))
        .join("/");
};

let tags = [
    "game_version", 
    "category", 
    "loader", 
    "donation_platform", 
    "report_type", 
    "license"
];

tags.forEach(async (tag) => {
    const url = `https://api.modrinth.com/api/v1/tag/${tag}`;
    const pascal = toPascalCase(tag);
    const plural = pluralize(tag);

    const response = await fetch(url);
    const json = await response.json();

    const structLocation = path.resolve("./src/structs");

    const prevStruct = await (fs.readFile(path.resolve(structLocation, `tags/${plural}.json`), "utf8").catch(() => null));
    const newStruct = JSON.stringify(json, null, 4);

    const changed = prevStruct !== newStruct;

    if (changed) {
        await fs.writeFile(
            path.resolve(structLocation, `tags/${plural}.json`),
            JSON.stringify(json, null, 4),
            "utf8"
        );

        const fileContent = `// Generated at ${new Date().toISOString()}${process.env["GITHUB_SHA"] ? `in ${process.env["GITHUB_SHA"]}` : ""}.` + "\n\n" 
            + `import ${plural} from ${JSON.stringify(`./${plural}.json`)};` + "\n"
            + `export { ${plural} };` + "\n\n"
            + `export type ${pascal}\n    = ${json.map((v) => JSON.stringify(v, null, 4)).join("\n    | ")};` + "\n";

        await fs.writeFile(
            path.resolve(structLocation, `tags/${pascal}.ts`),
            fileContent,
            "utf8"
        );

        console.log(`Modified: \t${pascal}.`);
        console.log(diffString(JSON.parse(prevStruct), json));
    } else console.log(`Not modified: \t${pascal}.`)
});
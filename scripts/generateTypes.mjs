import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import { quicktype, InputData, jsonInputForTargetLanguage } from "quicktype-core";

const typeMap = {
    "mod": {
        /**
         * sends 2 http requests.
         */
        getSources: async () => {
            let search = await fetch("https://api.modrinth.com/api/v1/mod?limit=100&index=updated");
            const { hits } = await search.json();

            const ids = hits.map((result) => result.mod_id.split("-")[1]);

            let response = await fetch(`https://api.modrinth.com/api/v1/mods?ids=${JSON.stringify(ids)}`);
            return await response.json();
        }
    },
    "version": {
        /**
         * sends 2 http requests.
         */
        getSources: async () => {
            const mods = await typeMap["mod"].getSources();
            
            // get the first 100 version ids.
            const ids = [...(mods.map((mod) => mod.versions))].flat().slice(0, 100);

            let response = await fetch(`https://api.modrinth.com/api/v1/versions?ids=${JSON.stringify(ids)}`);
            return await response.json();
        }
    },
    "user": {
        /**
         * @todo This is an extremely inefficient way of doing this.
         * but there isn't an endpoint for getting a list of users.
         * 
         * sends 6 http requests.
         */
        getSources: async () => {
            let search = await fetch("https://api.modrinth.com/api/v1/mod?limit=5&index=updated");
            const { hits } = await search.json();

            const sources = [];
            await Promise.all(hits.map(async (result) => {
                const response = await fetch(`https://api.modrinth.com/api/v1/user/${result.author}`);
                sources.push(await response.json());
            }));

            return sources;
        }
    }
}

const toPascalCase = (string) => {
    return string.split("/")
        .map(snake => snake.split("_")
            .map(substr => substr.charAt(0)
                .toUpperCase() +
                substr.slice(1))
            .join(""))
        .join("/");
};

async function buildType (type) {
    const pascal = toPascalCase(type);
    const filename = `${pascal}Source`;

    console.log(`Obtaining type samples:\t ${pascal}`)
    const sources = await typeMap[type].getSources();
    //console.log({sources})
    const input = jsonInputForTargetLanguage("typescript");

    await input.addSource({
        name: filename,
        samples: sources.map(source => {
            return JSON.stringify(source);
        })
    });

    const data = new InputData();
    data.addInput(input);

    const result = await quicktype({
        lang: "typescript",
        indentation: "    ",
        inputData: data,

        ignoreJsonRefs: true,
        combineClasses: false,
        inferBooleanStrings: false,
        inferIntegerStrings: false,
        inferDateTimes: false,
        inferUuids: false,
        inferEnums: false,
        inferMaps: false,

        rendererOptions: {
            "just-types": true,
            "runtime-typecheck": false
        },
    });

    const fileContent = `// Generated at ${new Date().toISOString()}${process.env["GITHUB_SHA"] ? `in ${process.env["GITHUB_SHA"]}` : ""}.` + "\n\n" 
        + result.lines.join("\n");

    await fs.writeFile(path.resolve("./src/structs", `${filename}.ts`), fileContent, "utf8");
    console.log(`Generated type file:\t ${filename}`)
}

Object.keys(typeMap).forEach(type => buildType(type));
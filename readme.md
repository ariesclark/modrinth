# Modrinth.js
JavaScript library for accessing the [**Modrinth**](https://modrinth.com) API.

[![Discord](https://img.shields.io/discord/418093857394262020?label=discord&style=for-the-badge)](https://discord.gg/WUgGJhS) [![Maintenance](https://img.shields.io/maintenance/yes/2021?style=for-the-badge)]() ![GitHub issues](https://img.shields.io/github/issues/rubybb/modrinth?style=for-the-badge) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/modrinth?style=for-the-badge) ![NPM](https://img.shields.io/npm/l/modrinth?style=for-the-badge)

## Resources
[**Website**](https://modrinth.js.org) -
[**Documentation**](https://modrinth.js.org/) -
[**Discord**](https://discord.gg/WUgGJhS)


## Install
Available on NPM: [**Modrinth.js**](https://www.npmjs.com/package/@rubybb/http)

Ruby's recommended package manager: <br/>
[**pnpm: 📦🚀 Fast, disk space efficient package manager**](https://pnpm.js.org/).

``pnpm install modrinth`` or ``npm install modrinth``.

## Examples
```ts
import { Modrinth } from "modrinth";

const modrinth = new Modrinth({
    // GitHub access token, optional.
    authorization: "..." 
});

modrinth.user("rubybb"); // Promise<User>
modrinth.user("suMONnLn"); // Promise<User>
modrinth.users(["rubybb", "jellysquid3"]); // Promise<[User, User]>
modrinth.users(["rubybb", "TEZXhE2U"]); // Promise<[User, User]>

modrinth.mod("lambdynamiclights"); // Promise<Mod>
modrinth.mod("yBW8D80W"); // Promise<Mod>
modrinth.mods(["lambdynamiclights", "sodium"]); // Promise<[Mod, Mod]>

modrinth.user("jellysquid3").then(async user => {
    const mods = await user.mods();
    console.log(mods);

    /* 
    * something like this. :) 
    * for the actual object returned, take a look the the documentation.
    * https://modrinth.js.org/classes/mod.html
    */
    [
        {
            id: "AANobbMI",
            slug: "sodium",
            title: "Sodium",
            status: "approved",
            downloads: 1490,
            ...
        },
        ...
    ]
});
```
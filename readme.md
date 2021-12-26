# Modrinth.js
JavaScript library for accessing the [**Modrinth**](https://modrinth.com) API.

[![Discord](https://img.shields.io/discord/418093857394262020?label=discord&style=for-the-badge)](https://discord.gg/azqKNq5geD) [![Maintenance](https://img.shields.io/maintenance/no/2022?style=for-the-badge)]() ![GitHub issues](https://img.shields.io/github/issues/rubybb/modrinth?style=for-the-badge) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/modrinth?style=for-the-badge) ![NPM](https://img.shields.io/npm/l/modrinth?style=for-the-badge)

**Disclaimer: This package is in no way an official package, nor will you recieve support from the Modrinth Team in any official capacity for using this package. Any and all problems or support should be directed to [Ruby](https://discord.gg/WUgGJhS), our [issue tracker](https://github.com/rubybb/modrinth/issues), or other contributors.**

## Resources
[**Website**](https://modrinth.js.org) -
[**Documentation**](https://modrinth.js.org/) -
[**Source**](https://github.com/rubybb/modrinth/) -
[**Discord**](https://discord.gg/azqKNq5geD)

## Install
Available on NPM: [**Modrinth.js**](https://www.npmjs.com/package/modrinth)

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

modrinth.version("hKXQNf9z"); // Promise<Version>
modrinth.versions(["YuZK7F05", "hKXQNf9z"]); // Promise<[Version, Version>]

modrinth.user("jellysquid3").then(async user => {
    const mods = await user.mods();
    console.log(mods);

    /* 
    * something like this. :) 
    * for the actual object returned, take a look at the documentation.
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

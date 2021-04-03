import { Modrinth } from "./lib/src/index.js";

const modrinth = new Modrinth({ debug: false });

const self = await modrinth.self();
console.log(`Welcome back, ${self.name}.`);

const mod = await modrinth.mod("test");
//mod.upload("changelog", {})
console.log(mod);
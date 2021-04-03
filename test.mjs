import { Modrinth } from "./lib/src/index.js";

const modrinth = new Modrinth({ debug: false });

const self = await modrinth.self();
console.log(`Welcome back, ${self.name}.`);

await self.update({bio: "hi uwu lol"});
console.log(self)
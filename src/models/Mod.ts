
import { Modrinth } from "../index";
import { ModrinthObject} from "../object";
import { ModSource } from "../structs/ModSource";
import { Category } from "../structs/tags/Category";

import { Version } from "./Version";

export interface License {
    id: string;
    name: string;
    url: string;
}

/** @internal */
export type ModSourceOmit = (
    "published" | "updated" | "versions"
);

export interface Mod extends Omit<ModSource, ModSourceOmit> {}
export class Mod extends ModrinthObject<typeof Mod, Mod, ModSource> {
    public static async get (modrinth: Modrinth, id: string): Promise<Mod> {
        return Mod.fromSource(modrinth, await Mod.fetch(modrinth, id));
    }

    public static async getMultiple (modrinth: Modrinth, ids: string[]): Promise<Mod[]> {
        return (await Mod.fetchMultiple(modrinth, ids)).map((mod) => Mod.fromSource(modrinth, mod));
    }
    
    public static async fetch (modrinth: Modrinth, id: string): Promise<ModSource> {
        return modrinth.api.get<ModSource>(Mod.getObjectLocation(id), {headers: {pragma: "no-cache"}});
    }

    public static async fetchMultiple (modrinth: Modrinth, ids: string[]): Promise<ModSource[]> {
        return modrinth.api.get<ModSource[]>("mods", {query: {ids: JSON.stringify(ids)}});
    }

    public static getObjectLocation (id: string) {
        return `mod/${id}`;
    }

    public static getResourceLocation (id: string) {
        return Mod.getObjectLocation(id);
    }

    public static getCacheKey (id: string): string {
        return Mod.getObjectLocation(id);
    }
    
    public static toSource (object: Mod): Partial<ModSource> {
        // if (object._source) return object._source;
        object = Object.assign(Object.create(null), object);
        Object.keys(object).forEach((key) => {
            const value = object[key];
            if (key.startsWith("_") || typeof value === "function")
                delete object[key];
        })

        const json = {...object as any};
        if (object.published) json.published = object.published.toISOString();
        if (object.updated) json.updated = object.updated.toISOString();

        return json as Partial<ModSource>;
    }

    public static fromSource (modrinth: Modrinth, source: ModSource): Mod {
        if (!modrinth.useCache) return new Mod(modrinth, source);

        const cacheKey = Mod.getCacheKey(source.id);
        const cached = modrinth.cache.get<Mod>(cacheKey);

        if (cached) return cached;
        return new Mod(modrinth, source);
    }

    public static async update (modrinth: Modrinth, id: string, update: Partial<Mod>): Promise<void> {
        const json = JSON.stringify(Mod.toSource(update as Mod), null, 4);
        return void await modrinth.api.patch(Mod.getObjectLocation(id), json, {
            resultType: "status"
        });
    }

    public mutate (source: ModSource): Mod {
        super.mutate(source);

        this.published = new Date(source.published);
        this.updated = new Date(source.updated);
        return this;
    }

    public published: Date;
    public updated: Date;

    public async versions (): Promise<Version[]> {
        return Version.getMultiple(this._modrinth, this._source.versions);
    }

    public async update (update: Partial<Mod>): Promise<Mod> {
        await Mod.update(this._modrinth, this.id, update);
        return await this.get();
    }

    public async createVersion (body: any, file: any): Promise<Version> {
        return Version.create(this._modrinth, {...body, mod_id: this.id}, file);
    }
}

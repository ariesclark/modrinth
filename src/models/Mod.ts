
import { Modrinth } from "../index";
import { ModrinthObject, ModrinthSourceObject} from "../object";

import { Version } from "./Version";

export interface ModSource extends ModrinthSourceObject {
    id: string;
    slug: string;
    team: string;
    title: string;
    description: string;
    body: string;
    body_url: string;
    published: string;
    updated: string;
    status: string;
    license: License;
    client_side: string;
    server_side: string;
    downloads: number;
    categories: string[];
    versions: string[];
    icon_url: string | null;
    issues_url: string | null;
    source_url: string | null;
    wiki_url: string | null;
    discord_url: string | null;
    donation_urls: string[];
}

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
    public static async get (id: string, modrinth: Modrinth): Promise<Mod> {
        return Mod.from(await Mod.fetch(id, modrinth), modrinth);
    }

    public static async getMultiple (ids: string[], modrinth: Modrinth): Promise<Mod[]> {
        return (await Mod.fetchMultiple(ids, modrinth)).map((mod) => Mod.from(mod, modrinth));
    }
    
    public static async fetch (id: string, modrinth: Modrinth): Promise<ModSource> {
        return modrinth.api.get<ModSource>(Mod.getObjectLocation(id));
    }

    public static async fetchMultiple (ids: string[], modrinth: Modrinth): Promise<ModSource[]> {
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

    protected static from (source: ModSource, modrinth: Modrinth): Mod {
        if (!modrinth.useCache) return new Mod(source, modrinth);

        const cacheKey = Mod.getCacheKey(source.id);
        const cached = modrinth.cache.get<Mod>(cacheKey);

        console.log(!!cached)

        if (cached) return cached;
        return new Mod(source, modrinth);
    }

    protected mutate (source: ModSource): void {
        super.mutate(source);

        this.published = new Date(source.published);
        this.updated = new Date(source.updated);
    }

    public published: Date;
    public updated: Date;

    public async versions (): Promise<Version[]> {
        return Version.getMultiple(this._source.versions, this._modrinth);
    }
}

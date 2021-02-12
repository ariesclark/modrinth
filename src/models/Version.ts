
import { Modrinth } from "../index";
import { ModrinthObject, ModrinthSourceObject} from "../object";

import { Mod } from "./Mod";
import { User } from "./User";

export interface File {
    hashes: {[key: string]: string};
    filename: string;
    primary: boolean;
    url: string;
}

export interface VersionSource extends ModrinthSourceObject {
    id: string;
    mod_id: string;
    author_id: string;
    featured: boolean;
    name: string;
    version_number: string;
    changelog: string;
    changelog_url: string | null;
    date_published: string;
    downloads: number;
    version_type: string;
    files: File[];
    dependencies: any[];
    game_versions: string[];
    loaders: string[];
}

/** @internal */
export type VersionSourceOmit = (
    "date_published"
);

export interface Version extends Omit<VersionSource, VersionSourceOmit> {}
export class Version extends ModrinthObject<typeof Version, Version, VersionSource> {
    public static async get (id: string, modrinth: Modrinth): Promise<Version> {
        return Version.from(await Version.fetch(id, modrinth), modrinth);
    }

    public static async getMultiple (ids: string[], modrinth: Modrinth): Promise<Version[]> {
        return (await Version.fetchMultiple(ids, modrinth)).map((version) => Version.from(version, modrinth));
    }
    
    public static async fetch (id: string, modrinth: Modrinth): Promise<VersionSource> {
        return modrinth.api.get<VersionSource>(Version.getObjectLocation(id));
    }

    public static async fetchMultiple (ids: string[], modrinth: Modrinth): Promise<VersionSource[]> {
        return modrinth.api.get<VersionSource[]>("versions", {query: {ids: JSON.stringify(ids)}})
    }

    public static getObjectLocation (id: string) {
        return `version/${id}`;
    }

    public static getResourceLocation (id: string) {
        return Version.getObjectLocation(id);
    }

    public static getCacheKey (id: string): string {
        return Version.getObjectLocation(id);
    }

    protected static from (source: VersionSource, modrinth: Modrinth): Version {
        if (!modrinth.useCache) return new Version(source, modrinth);

        const cacheKey = Version.getCacheKey(source.id);
        const cached = modrinth.cache.get<Version>(cacheKey);

        if (cached) return cached;
        return new Version(source, modrinth);
    }

    protected mutate (source: VersionSource): void {
        super.mutate(source);

        this.date_published = new Date(source.date_published);
    }

    public date_published: Date;

    public async getMod (): Promise<Mod> {
        return Mod.get(this.mod_id, this._modrinth);
    }

    public async getAuthor (): Promise<User> {
        return User.get(this.author_id, this._modrinth);
    }
}
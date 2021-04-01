import FormData from "form-data";

import { Modrinth } from "../index";
import { ModrinthObject, ModrinthSourceObject} from "../object";

import { Mod } from "./Mod";
import { User } from "./User";

import fetch from "node-fetch";


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
    public static async get (modrinth: Modrinth, id: string): Promise<Version> {
        return Version.from(modrinth, await Version.fetch(modrinth, id));
    }

    public static async getMultiple (modrinth: Modrinth, ids: string[]): Promise<Version[]> {
        return (await Version.fetchMultiple(modrinth, ids)).map((version) => Version.from(modrinth, version));
    }
    
    public static async fetch (modrinth: Modrinth, id: string): Promise<VersionSource> {
        return modrinth.api.get<VersionSource>(Version.getObjectLocation(id));
    }

    public static async fetchMultiple (modrinth: Modrinth, ids: string[]): Promise<VersionSource[]> {
        return modrinth.api.get<VersionSource[]>("versions", {query: {ids: JSON.stringify(ids)}})
    }

    public static getObjectLocation (id: string): string {
        return `version/${id}`;
    }

    public static getResourceLocation (id: string): string {
        throw new Error("Version doesn't have static resource location");
    }

    public static getCacheKey (id: string): string {
        return Version.getObjectLocation(id);
    }

    protected static from (modrinth: Modrinth, source: VersionSource): Version {
        if (!modrinth.useCache) return new Version(modrinth, source);

        const cacheKey = Version.getCacheKey(source.id);
        const cached = modrinth.cache.get<Version>(cacheKey);

        if (cached) return cached;
        return new Version(modrinth, source);
    }

    public static async create (modrinth: Modrinth, body: any, files: any[]): Promise<Version> {
        const form = new FormData();
        form.append("data", JSON.stringify({...body, ...{
            file_parts: files.map((file, index) => `${file.name}-${index}`)
        }}));

        files.map((file, index) => {
            form.append(`${file.name}-${index}`, file.data, {
                filename: file.name,
            })
        })

        console.log(form)
        let r = await fetch("https://api.modrinth.com/api/v1/version", {
            method: "post",
            body: form,
            
            headers: {
                ...modrinth.api.options.headers,
                ...form.getHeaders()
            }
        })

        console.log(r, await r.json())
        return null;
        //const raw = await modrinth.api.post<VersionSource>("version", form.toString(), {headers: form.getHeaders()});

        //console.log(raw);
        //return Version.from(modrinth, raw);
    }

    protected mutate (source: VersionSource): void {
        super.mutate(source);
        
        this.date_published = new Date(source.date_published);
    }

    public getResourceLocation (): string {
        return `${Mod.getResourceLocation(this.mod_id)}/version/${this.id}`;
    }

    public date_published: Date;

    public async getMod (): Promise<Mod> {
        return Mod.get(this._modrinth, this.mod_id);
    }

    public async getAuthor (): Promise<User> {
        return User.get(this._modrinth, this.author_id);
    }
}
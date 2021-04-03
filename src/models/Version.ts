import FormData from "form-data";

import { Modrinth } from "../index";
import { ModrinthObject} from "../object";

import { Mod } from "./Mod";
import { User } from "./User";

import fetch from "node-fetch";
import { Loader } from "../structs/tags/Loader";
import { VersionSource } from "../structs/VersionSource";
import { GameVersion } from "../structs/tags/GameVersion";

export interface UploadFile {
    name: string;
    data: any;
}

export type VersionType = "release" | "beta" | "alpha";

export interface VersionCreationSource {
    mod_id: string;
    file_parts: string[];
    version_number: string;
    version_title: string;
    version_body: string;
    dependencies: unknown[];
    game_versions: string[];
    release_channel: VersionType
    loaders: Loader[];
    featured: boolean;
}

export interface VersionCreation {
    mod_id: string;
    title?: string;
    number: string;
    body: string;
    dependencies?: unknown[];
    game_versions: string[];
    type: VersionType;
    loaders: Loader[];
    featured?: boolean;
}

/** @internal */
export type VersionSourceOmit = (
    "date_published"
    | "version_type"
);

export interface Version extends Omit<VersionSource, VersionSourceOmit> {
    date_published: Date;
    type: VersionType;
    
    loaders: Loader[];
    game_versions: GameVersion[];
    
}

export class Version extends ModrinthObject<typeof Version, Version, VersionSource> {
    public static async get (modrinth: Modrinth, id: string): Promise<Version> {
        return Version.fromSource(modrinth, await Version.fetch(modrinth, id));
    }

    public static async getMultiple (modrinth: Modrinth, ids: string[]): Promise<Version[]> {
        return (await Version.fetchMultiple(modrinth, ids)).map((version) => Version.fromSource(modrinth, version));
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

    public static toSource (object: Version): VersionSource {
        if (object._source) return object._source;
    }

    public static fromSource (modrinth: Modrinth, source: VersionSource): Version {
        if (!modrinth.useCache) return new Version(modrinth, source);

        const cacheKey = Version.getCacheKey(source.id);
        const cached = modrinth.cache.get<Version>(cacheKey);

        if (cached) return cached;
        return new Version(modrinth, source);
    }

    public static async create (modrinth: Modrinth, body: VersionCreation, files: UploadFile[]): Promise<Version> {
        const form = new FormData();
        const data: VersionCreationSource = {
            mod_id: body.mod_id,

            version_title: body.title || body.number,
            version_number: body.number,
            version_body: body.body,

            loaders: body.loaders,
            game_versions: body.game_versions,
            release_channel: body.type,

            featured: body.featured ?? false,
            dependencies: body.dependencies || [],

            file_parts: files.map((_, index) => `${index}`)
        };

        form.append("data", JSON.stringify(data));
        files.map((file, index) => {
            form.append(`${index}`, file.data, {
                filename: file.name,
            })
        });

        return Version.fromSource(
            modrinth, 
            await modrinth.api.post<VersionSource>("version", form, {
                headers: form.getHeaders()
            }
        ));
    }

    public mutate (source: VersionSource): Version {
        const _source = Object.assign({}, source);

        delete _source["version_type"];
        super.mutate(_source);

        this.type = source.version_type as VersionType;
        this.date_published = new Date(source.date_published);
        return this;
    }

    public getResourceLocation (): string {
        return `${Mod.getResourceLocation(this.mod_id)}/version/${this.id}`;
    }

    public async getMod (): Promise<Mod> {
        return Mod.get(this._modrinth, this.mod_id);
    }

    public async getAuthor (): Promise<User> {
        return User.get(this._modrinth, this.author_id);
    }
}
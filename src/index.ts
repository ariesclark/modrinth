import { HTTP } from "@rubybb/http";
import { all as merge } from "deepmerge";
import { Cache } from "./cache";

import * as Package from "../package.json";

import { Version } from "./models/Version";
import { User } from "./models/User";
import { Mod } from "./models/Mod";

export interface Options {
    authorization: string;
    cache: number | false;
    debug: boolean;
    url: string;
}

/** @internal */
export const isBrowser = typeof window !== "undefined";

export class Modrinth {
    public static get defaultOptions (): Partial<Options> {
        return {
            url: "https://api.modrinth.com/api/v1/",
            authorization: (!isBrowser ? 
                process.env["MODRINTH_TOKEN"] :
                localStorage.getItem("MODRINTH_TOKEN")
            ) || "",
            debug: false,
            cache: 300
        };
    }

    public options: Partial<Options> = {};
    /** @internal */
    public cache: Cache;
    /** @internal */
    public api: HTTP;

    constructor (options: Partial<Options> = {}) {
        this.options = merge([{}, Modrinth.defaultOptions, options]);

        if (typeof this.options.cache === "number") {
            this.cache = new Cache({
                ttl: this.options.cache,
                capacity: 100,

            });
        }

        this.api = HTTP.create({
            baseURL: this.options.url,
            debug: this.options.debug,
            resultType: "json",
            headers: {
                "content-type": "application/json",
                "user-agent": (!isBrowser ? 
                    `Modrinth v${Package.version} <http://npmjs.com/modrinth>` :
                    window.navigator.userAgent
                )
            }
        });

        this.login(this.options.authorization);
    }

    public get useCache (): boolean {
        return typeof this.options.cache === "number" && !!this.cache;
    }

    public login (token: string): void {
        if (token) this.api.mutate({headers: {"authorization": token}});
    } 

    public async user (id: string): Promise<User> {
        return User.get(id, this);
    }

    public async users (id: string[]): Promise<User[]>;
    public async users (...id: string[]): Promise<User[]>;
    public async users (...ids: string[] | [string[]]): Promise<User[]> {
        return User.getMultiple(([].concat(...ids)), this);
    }
    public async mod (id: string): Promise<Mod> {
        return Mod.get(id, this);
    }

    public async mods (id: string[]): Promise<Mod[]>;
    public async mods (...id: string[]): Promise<Mod[]>;
    public async mods (...ids: string[] | [string[]]): Promise<Mod[]> {
        return Mod.getMultiple(([].concat(...ids)), this);
    }

    public async version (id: string): Promise<Version> {
        return Version.get(id, this);
    }

    public async versions (id: string[]): Promise<Version[]>;
    public async versions (...id: string[]): Promise<Version[]>;
    public async versions (...ids: string[] | [string[]]): Promise<Version[]> {
        return Version.getMultiple(([].concat(...ids)), this);
    }
}
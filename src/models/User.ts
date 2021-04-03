import { Modrinth } from "..";
import { ModrinthObject } from "../object";
import { UserSource } from "../structs/UserSource";
import { Mod } from "./Mod";

/** @internal */
export type UserSourceOmit = (
    "created"
);

export interface User extends Omit<UserSource, UserSourceOmit> {
    created: Date;
}

export class User extends ModrinthObject<typeof User, User, UserSource> {
    public static async get (modrinth: Modrinth, id: string): Promise<User> {
        return User.fromSource(modrinth, await User.fetch(modrinth, id));
    }

    public static async getMultiple (modrinth: Modrinth, ids: string[]): Promise<User[]> {
        return (await User.fetchMultiple(modrinth, ids)).map((user) => User.fromSource(modrinth, user));
    }
    
    public static async fetch (modrinth: Modrinth, id: string): Promise<UserSource> {
        return modrinth.api.get<UserSource>(User.getObjectLocation(id));
    }

    public static async fetchMultiple (modrinth: Modrinth, ids: string[]): Promise<UserSource[]> {
        return modrinth.api.get<UserSource[]>("users", {query: {ids: JSON.stringify(ids)}})
    }

    public static getObjectLocation (id: string) {
        return `user/${id}`;
    }

    public static getResourceLocation (id: string) {
        return User.getObjectLocation(id);
    }

    public static getCacheKey (id: string): string {
        return User.getObjectLocation(id);
    }
    
    public static toSource (object: User): Partial<UserSource> {
        // if (object._source) return object._source;
        object = Object.assign(Object.create(null), object);
        Object.keys(object).forEach((key) => {
            const value = object[key];
            if (key.startsWith("_") || typeof value === "function")
                delete object[key];
        })

        const json = {...object as any};
        if (object.created) json.created = object.created.toISOString();

        return json as Partial<UserSource>;
    }

    public static fromSource (modrinth: Modrinth, source: UserSource): User {
        if (!modrinth.useCache) return new User(modrinth, source);

        const cacheKey = User.getCacheKey(source.id);
        const cached = modrinth.cache.get<User>(cacheKey);

        if (cached) return cached;
        return new User(modrinth, source);
    }

    public static async current (modrinth: Modrinth): Promise<User> {
        return User.fromSource(modrinth, await modrinth.api.get<UserSource>("user"));
    }

    public static async update (modrinth: Modrinth, id: string, update: Partial<User>): Promise<void> {
        const json = JSON.stringify(User.toSource(update as User), null, 4);
        return void await modrinth.api.patch(User.getObjectLocation(id), json, {
            resultType: "status"
        });
    }

    public mutate (source: UserSource): User {
        super.mutate(source);

        this.created = new Date(source.created);
        return this;
    }


    public async update (update: Partial<User>): Promise<User> {
        await User.update(this._modrinth, this.id, update);
        return await this.get();
    }

    public async mods (): Promise<Mod[]> {
        const ids = await this._modrinth.api.get<string[]>(`user/${this.id}/mods`);
        return Mod.getMultiple(this._modrinth, ids);
    }
}


import { Modrinth } from "../index";
import { ModrinthObject, ModrinthSourceObject} from "../object";

import { Mod, ModSource } from "./Mod";

export interface UserSource extends ModrinthSourceObject {
    id: string;
    github_id: number;
    username: string;
    name: string;
    bio: string;
    email: string;
    created: string;
    avatar_url: string;
    role: string;
}

/** @internal */
export type UserSourceOmit = (
    "created"
);

/**
 * Regular description
 *
 * @category Category Name
 */
export interface User extends Omit<UserSource, UserSourceOmit> {}
export class User extends ModrinthObject<typeof User, User, UserSource> {

    public static async get (modrinth: Modrinth, id: string): Promise<User> {
        return User.from(modrinth, await User.fetch(modrinth, id));
    }

    public static async getMultiple (modrinth: Modrinth, ids: string[]): Promise<User[]> {
        return (await User.fetchMultiple(modrinth, ids)).map((user) => User.from(modrinth, user));
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

    protected static from (modrinth: Modrinth, source: UserSource): User {
        if (!modrinth.useCache) return new User(modrinth, source);

        const cacheKey = User.getCacheKey(source.id);
        const cached = modrinth.cache.get<User>(cacheKey);

        if (cached) return cached;
        return new User(modrinth, source);
    }

    protected mutate (source: UserSource): void {
        super.mutate(source);

        this.created = new Date(source.created);
    }

    public created: Date;

    public async mods (): Promise<Mod[]> {
        const ids = await this._modrinth.api.get<string[]>(`user/${this.id}/mods`);
        return Mod.getMultiple(this._modrinth, ids);
    }
}
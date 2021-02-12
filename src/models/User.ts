
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

    public static async get (id: string, modrinth: Modrinth): Promise<User> {
        return User.from(await User.fetch(id, modrinth), modrinth);
    }

    public static async getMultiple (ids: string[], modrinth: Modrinth): Promise<User[]> {
        return (await User.fetchMultiple(ids, modrinth)).map((user) => User.from(user, modrinth));
    }
    
    public static async fetch (id: string, modrinth: Modrinth): Promise<UserSource> {
        return modrinth.api.get<UserSource>(User.getObjectLocation(id));
    }

    public static async fetchMultiple (ids: string[], modrinth: Modrinth): Promise<UserSource[]> {
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

    protected static from (source: UserSource, modrinth: Modrinth): User {
        if (!modrinth.useCache) return new User(source, modrinth);

        const cacheKey = User.getCacheKey(source.id);
        const cached = modrinth.cache.get<User>(cacheKey);

        if (cached) return cached;
        return new User(source, modrinth);
    }

    protected mutate (source: UserSource): void {
        super.mutate(source);

        this.created = new Date(source.created);
    }

    public created: Date;

    public async mods (): Promise<Mod[]> {
        const ids = await this._modrinth.api.get<string[]>(`user/${this.id}/mods`);
        return Mod.getMultiple(ids, this._modrinth);
    }
}
export interface CacheOptions {
    ttl: number;
    capacity: number;
}

export interface CacheData<Item> {
    value: Item;
    expiry: number;
}

export type CacheCallbackFn<Return> = () => Return;
export type CacheMap<Item> = {[key: string]: CacheData<Item>};

export class Cache <Item = unknown> {
    public static defaultOptions: CacheOptions = {
        ttl: Infinity,
        capacity: Infinity
    }

    protected options: Partial<CacheOptions> = {};
    protected data: CacheMap<Item>;

    constructor (options: Partial<CacheOptions> = Object.create(null)) {
        Object.assign(this.options, Cache.defaultOptions, options);
        this.data = Object.create(null);
    }

    public get now (): number {
        return Date.now();
    }

    public get capacity (): number {
        return this.options.capacity;
    }

    public get size (): number {
        return Object.keys(this.data).length;
    }

    public get empty (): boolean {
        return this.size <= 0;
    }

    public get full () {
        return this.size >= this.capacity;
    }

    public get percent (): number {
        return (this.size / this.capacity) * 100;
    }

    public get <GetItem extends Item> (key: string): GetItem {
        if (!this.data[key]) return;
        if (this.data[key].expiry >= Date.now()) {
            this.delete(key);
            return;
        }

        return this.data[key].value as GetItem;
    }

    public has (key: string): boolean {
        return !!this.get(key);
    }

    public set (key: string, value: Item, ttl?: number): CacheData<Item> {
        if (!ttl) ttl = this.options.ttl;
        if (this.full) this.prune(1);

        return this.data[key] = {
            expiry: this.now + ttl,
            value
        };
    }

    public prune (amount: number = 1) {
        /** the keys of the {amount} oldest items. */ 
        const keys = Object.keys(this.data).splice(0, amount);

        for (const key in keys) {
            this.delete(key);
        }
    }

    public delete (key: string): void {
        if (this.data[key]) delete this.data[key];
    }

    public clear (): void {
        this.data = Object.create(null);
    }
}
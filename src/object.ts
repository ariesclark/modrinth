import type { Modrinth } from "./index";

export interface ModrinthStaticModel <ObjectResult, ObjectSource> extends Function {
    get: (modrinth: Modrinth, id: string) => Promise<ObjectResult>;
    getMultiple: (modrinth: Modrinth, id: string[]) => Promise<ObjectResult[]>;

    fetch: (modrinth: Modrinth, id: string) => Promise<ObjectSource>;
    fetchMultiple: (modrinth: Modrinth, id: string[]) => Promise<ObjectSource[]>;

    getResourceLocation: (id: string) => string;
    getObjectLocation: (id: string) => string;

    getCacheKey: (id: string) => string;

    fromSource: (modrinth: Modrinth, source: ObjectSource) =>  ObjectResult;
    toSource: (object: ObjectResult) => Partial<ObjectSource>;
    // toPartialSource: (object: Partial<ObjectResult>) => Partial<ObjectSource>;
}

export class ModrinthObject <
    ModelStatic extends ModrinthStaticModel <ObjectResult, ObjectSource>, 
    ObjectResult extends ModrinthObject <ModelStatic, ObjectResult, ObjectSource>, 
    ObjectSource
> {
    protected ["constructor"]: ModelStatic;
    
    protected _source: ObjectSource;
    protected _modrinth: Modrinth;
    protected _dirty: boolean = false;

    public id: string;

    public object_url: string;
    public resource_url: string;
    
    constructor (modrinth: Modrinth, source: ObjectSource) {
        this._modrinth = modrinth;
        this._source = source;

        this.mutate(source);

        this.object_url = this.getObjectURL();
        this.resource_url = this.getResourceURL();

        if (!modrinth.useCache) return;
        modrinth.cache.set(this.constructor.getCacheKey(this.id), this);
    }

    protected mutate (source: ObjectSource): ObjectResult {
        for (let key in source) {
            if (Object.getPrototypeOf(this)[key]) continue;

            Object.defineProperty(this, key, {
                value: source[key],
                configurable: true,
                enumerable: true,
                writable: true
            })
        }

        // NOTE: Dangerous type casting??
        return this as unknown as ObjectResult;
    }

    protected async fetch (): Promise<ObjectSource> {
        const Model = this.constructor;
        return Model.fetch(this._modrinth, this.id);
    }

    async get (): Promise<ObjectResult> {
        return this.mutate(await this.fetch());
    }

    getResourceLocation (): string {
        return this.constructor.getResourceLocation((this as any).slug || this.id);
    }

    getResourceURL (): string {
        return this._modrinth.siteURL + this.getResourceLocation();
    }

    getObjectLocation (): string {
        return this.constructor.getObjectLocation(this.id);
    }

    getObjectURL (): string {
        return this._modrinth.apiURL + this.getObjectLocation();
    }

    toJSON (): unknown {
        // remove circular structures.
        const { _modrinth, _source, ...object } = this;
        return object;
    }

    toString (): string {
        const identifier = (this as any).name || (this as any).title || (this as any).slug || this.id;
        return `${identifier} <${this.constructor.name}; ${this.resource_url}>`;
    }
}
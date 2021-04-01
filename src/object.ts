import type { Modrinth } from "./index";

export interface ModrinthSourceObject {
    id: string
}

export interface ModrinthStaticModel <ObjectResult, ObjectSource> extends Function {
    get: (modrinth: Modrinth, id: string) => Promise<ObjectResult>;
    getMultiple: (modrinth: Modrinth, id: string[]) => Promise<ObjectResult[]>;

    fetch: (modrinth: Modrinth, id: string) => Promise<ObjectSource>;
    fetchMultiple: (modrinth: Modrinth, id: string[]) => Promise<ObjectSource[]>;

    getResourceLocation: (id: string) => string;
    getObjectLocation: (id: string) => string;

    getCacheKey: (id: string) => string;
}

export class ModrinthObject <
    ModelStatic extends ModrinthStaticModel <ObjectResult, ObjectSource>, 
    ObjectResult extends ModrinthObject <ModelStatic, ObjectResult, ObjectSource>, 
    ObjectSource extends ModrinthSourceObject
> implements ModrinthSourceObject {
    protected ["constructor"]: ModelStatic;
    
    protected _source: ObjectSource;
    protected _modrinth: Modrinth;

    public id: string;

    public objectURL: string;
    public resourceURL: string;
    
    constructor (modrinth: Modrinth, source: ObjectSource) {
        this._modrinth = modrinth;
        this._source = source;

        this.mutate(source);

        this.objectURL = this.getObjectURL();
        this.resourceURL = this.getResourceURL();

        if (!modrinth.useCache) return;
        modrinth.cache.set(this.constructor.getCacheKey(this.id), this);
    }

    protected mutate (source: ObjectSource): void {
        for (let key in source) {

            // don't override existing values.
            if (this[key as string]) continue;

            Object.defineProperty(this, key, {
                value: source[key],
                configurable: true,
                enumerable: true,
                writable: true
            })
        }
    }

    async fetch (): Promise<ObjectSource> {
        const Model = (this.constructor as any);
        return Model.fetch(this._modrinth, this.id);
    }

    getResourceLocation (): string {
        return this.constructor.getResourceLocation(this.id);
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

    toString (): string {
        // return JSON.stringify(this);
        return `${this.id} <${this.constructor.name}; ${this.getResourceURL()}>`;
    }
}
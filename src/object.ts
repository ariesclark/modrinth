import type { Modrinth } from "./index";

export interface ModrinthSourceObject {
    id: string
}

export interface ModrinthStaticModel <ObjectResult, ObjectSource> extends Function {
    get: (id: string, modrinth: Modrinth) => Promise<ObjectResult>;
    getMultiple: (id: string[], modrinth: Modrinth) => Promise<ObjectResult[]>;

    fetch: (id: string, modrinth: Modrinth) => Promise<ObjectSource>;
    fetchMultiple: (id: string[], modrinth: Modrinth) => Promise<ObjectSource[]>;

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
    
    constructor (source: ObjectSource, modrinth: Modrinth) {
        this._modrinth = modrinth;
        this._source = source;

        this.mutate(source);

        this.objectURL = this.getObjectURL();
        this.resourceURL = this.getResourceURL();

        if (!modrinth.useCache) return;
        modrinth.cache.set(this.constructor.getCacheKey(this.id), this);
    }

    protected mutate (source: ObjectSource): void {
        Object.assign(this, source);
    }

    async fetch (): Promise<ObjectSource> {
        const Model = (this.constructor as any);
        return Model.fetch(this.id, this._modrinth);
    }

    getResourceLocation (): string {
        return this.constructor.getResourceLocation(this.id);
    }

    getResourceURL (): string {
        return "https://modrinth.com/" + this.getObjectLocation();
    }

    getObjectLocation (): string {
        return this.constructor.getObjectLocation(this.id);
    }

    getObjectURL (): string {
        return this._modrinth.options.url + this.getResourceLocation();
    }

    toString (): string {
        return `${this.id} <${this.constructor.name}; ${this.getResourceURL()}>`;
    }
}
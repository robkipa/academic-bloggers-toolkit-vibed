import { omit } from 'lodash';

interface CacheJSON<T> {
    [k: string]: {
        expires: number;
        data: Record<string, T>;
    };
}

interface StorageFallback extends Storage {
    _value: Map<string, string>;
}

/** Get storage for the current context (works in editor iframe; avoids top which can be undefined). */
function getStorage(): Storage | null {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
        }
    } catch {
        // ignore
    }
    return null;
}

function createFallbackStorage(): StorageFallback {
    return {
        _value: new Map(),
        get length() {
            return this._value.size;
        },
        clear() {
            this._value.clear();
        },
        getItem(key) {
            return this._value.get(key) || null;
        },
        key(index) {
            return [...this._value.keys()][index] || null;
        },
        removeItem(key) {
            this._value.delete(key);
        },
        setItem(key, value) {
            this._value.set(key, value);
        },
    };
}

abstract class AbstractCache<T> {
    private readonly PREFIX = 'ABT_CACHE_';
    private readonly VERSION = 'v1.0';
    private readonly EXPIRES: number;
    private readonly ITEM_KEY: string;
    private readonly KEY = `${this.PREFIX}${this.VERSION}`;
    private readonly _cache: Storage;

    constructor(key: string, daysTilExpiration = 30) {
        const ONE_DAY = 86400000;
        this.ITEM_KEY = key;
        this.EXPIRES = Date.now() + ONE_DAY * daysTilExpiration;
        this._cache = getStorage() || createFallbackStorage();
        const { KEY, PREFIX } = this;

        // Purge old cache versions
        try {
            Object.keys(this._cache)
                .filter(k => k.startsWith(PREFIX) && k !== KEY)
                .forEach(k => this._cache.removeItem(k));
        } catch {
            // ignore when storage is unavailable or restricted
        }
    }

    abstract fetchItem(key: string): Promise<T>;

    getItem(key: string): T | null {
        return this.cache[key] || null;
    }
    removeItem(key: string): void {
        this.cache = omit(this.cache, key);
    }
    setItem(key: string, value: T): void {
        this.cache = {
            ...this.cache,
            [key]: value,
        };
    }

    private get cache(): Record<string, T> {
        const { EXPIRES: expires, ITEM_KEY, KEY } = this;
        const value: CacheJSON<T> = JSON.parse(
            this._cache.getItem(KEY) || '{}',
        );
        let item = value[ITEM_KEY];
        if (!item || item.expires < Date.now()) {
            item = {
                expires,
                data: {},
            };
            this._cache.setItem(
                KEY,
                JSON.stringify({
                    ...value,
                    [ITEM_KEY]: { ...item },
                }),
            );
        }
        return { ...item.data };
    }
    private set cache(data: Record<string, T>) {
        const { ITEM_KEY, KEY } = this;
        const value: CacheJSON<T> = JSON.parse(
            this._cache.getItem(KEY) || '{}',
        );
        const item = value[ITEM_KEY];
        this._cache.setItem(
            KEY,
            JSON.stringify({ ...value, [ITEM_KEY]: { ...item, data } }),
        );
    }

}

/** Promise-based fetch to avoid async/await (and thus regeneratorRuntime) in editor iframe. */
export const localeCache = new (class extends AbstractCache<string> {
    private parser = new DOMParser();

    fetchItem(style: string): Promise<string> {
        const xml = this.parser.parseFromString(style, 'application/xml');
        const styleNode = xml.querySelector('style');
        if (xml.querySelector('parsererror')) {
            return Promise.reject(new Error('Invalid style XML'));
        }
        if (!styleNode) {
            return Promise.reject(new Error('CSL style is not valid'));
        }
        const localeId = styleNode.getAttribute('default-locale') || 'en-US';
        return fetch(
            `https://raw.githubusercontent.com/citation-style-language/locales/master/locales-${localeId}.xml`,
        ).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        }).then(locale => {
            this.setItem(localeId, locale);
            return locale;
        });
    }
})('locales');

/** Promise-based fetch to avoid async/await (and thus regeneratorRuntime) in editor iframe. */
export const styleCache = new (class extends AbstractCache<string> {
    fetchItem(styleId: string): Promise<string> {
        const cached = this.getItem(styleId);
        if (cached !== null) {
            return Promise.resolve(cached);
        }
        return fetch(
            `https://raw.githubusercontent.com/citation-style-language/styles/master/${styleId}.csl`,
        ).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        }).then(style => {
            this.setItem(styleId, style);
            return style;
        });
    }
})('styles');

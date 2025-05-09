import { MMKV } from "react-native-mmkv"
import { SynchronousCache } from "./interface"
import { createKey } from "~Utils/CacheKeyUtils/CacheKeyUtils"
import { CryptoUtils, error } from "~Utils"
import { ERROR_EVENTS } from "~Constants"

export interface MMKVConfiguration {
    /**
     * The MMKV instance's ID. If you want to use multiple instances, make sure to use different IDs!
     *
     * @example
     * ```ts
     * const userStorage = new MMKV({ id: `user-${userId}-storage` })
     * const globalStorage = new MMKV({ id: 'global-app-storage' })
     * ```
     *
     * @default 'mmkv.default'
     */
    id: string
    /**
     * The MMKV instance's root path. By default, MMKV stores file inside `$(Documents)/mmkv/`. You can customize MMKV's root directory on MMKV initialization:
     *
     * @example
     * ```ts
     * const temporaryStorage = new MMKV({ path: '/tmp/' })
     * ```
     */
    path?: string
    /**
     * The MMKV instance's encryption/decryption key. By default, MMKV stores all key-values in plain text on file, relying on iOS's sandbox to make sure the file is encrypted.
     * Should you worry about information leaking, you can choose to encrypt MMKV.
     *
     * @example
     * ```ts
     * const secureStorage = new MMKV({ encryptionKey: 'my-encryption-key!' })
     * ```
     */
    encryptionKey?: string
}

export default class SecurePersistedCache<T> implements SynchronousCache<T> {
    readonly _cache: MMKV
    private encryptionKey: string | undefined

    constructor(cacheKey: string, encryptionKey: string) {
        this.encryptionKey = encryptionKey
        const config: MMKVConfiguration = { id: cacheKey }
        this._cache = new MMKV(config)
    }

    public lock() {
        this.encryptionKey = undefined
    }
    public unlock(encryptionKey: string) {
        this.encryptionKey = encryptionKey
    }

    public itemExists(key: string): boolean {
        if (!this.encryptionKey) throw Error("Encryption key not set")
        const value = this._cache.getString(createKey(key))
        return !!value
    }
    public getItem(key: string): T | undefined {
        if (!this.encryptionKey) throw Error("Encryption key not set")
        const value = this._cache.getString(createKey(key))

        if (!value) return undefined

        try {
            const decryptedItem = JSON.parse(CryptoUtils.decryptState(value, this.encryptionKey))
            return decryptedItem as T
        } catch (e) {
            error(ERROR_EVENTS.ENCRYPTION, `Error getting item ${key}`, e)
            return undefined
        }
    }
    public setItem(key: string, item: T): void {
        if (!this.encryptionKey) throw Error("Encryption key not set")
        this._cache.set(createKey(key), CryptoUtils.encryptState<T>(item, this.encryptionKey))
    }
    public removeItem(key: string): void {
        if (!this.encryptionKey) throw Error("Encryption key not set")
        this._cache.delete(createKey(key))
    }
    public reset(): void {
        this._cache.clearAll()
        this.encryptionKey = undefined
    }
}

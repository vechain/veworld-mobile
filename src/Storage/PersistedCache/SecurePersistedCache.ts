import { MMKV, MMKVConfiguration } from "react-native-mmkv"
import { SynchronousCache } from "./interface"
import { createKey } from "~Utils/CacheKeyUtils/CacheKeyUtils"
import { CryptoUtils, error } from "~Utils"

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
            const decryptedItem = JSON.parse(
                CryptoUtils.decryptState(value, this.encryptionKey),
            )
            return decryptedItem as T
        } catch (e) {
            error(`Error getting item ${key}`, e)
            return undefined
        }
    }
    public setItem(key: string, item: T): void {
        if (!this.encryptionKey) throw Error("Encryption key not set")
        this._cache.set(
            createKey(key),
            CryptoUtils.encryptState<T>(item, this.encryptionKey),
        )
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

import { MMKV, MMKVConfiguration } from "react-native-mmkv"
import { createKey } from "~Utils/CacheKeyUtils/CacheKeyUtils"
import { initEncryption } from "~Services/EncryptionService"
import { CryptoUtils, error } from "~Utils"
import { CACHE_IMAGE_KEY } from "./constants"

const config: MMKVConfiguration = { id: "cache-metadata" }
const _cache = new MMKV(config)

let encrKey: string | undefined

const initKey = () => {
    initEncryption(CACHE_IMAGE_KEY)
        .then(key => (encrKey = key))
        .catch(err => error("Failed to init encryption key", err))
}

initKey()

const setItem = (itemKey: string, value: string): void => {
    if (!encrKey) throw Error("Encryption key not initialized")
    _cache.set(
        createKey(itemKey),
        CryptoUtils.encryptState<string>(value, encrKey),
    )
}
const getItem = (itemKey: string): string | undefined => {
    if (!encrKey) throw Error("Encryption key not initialized")
    const value = _cache.getString(createKey(itemKey))
    return value
        ? JSON.parse(CryptoUtils.decryptState(value, encrKey))
        : undefined
}
const removeItem = (itemKey: string): void => {
    _cache.delete(createKey(itemKey))
}

const reset = (): void => {
    _cache.clearAll()
    initKey()
}

export default {
    setItem,
    getItem,
    removeItem,
    reset,
}

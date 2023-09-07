import { MMKV, MMKVConfiguration } from "react-native-mmkv"
import { TokenMetadata } from "~Model"
import { createKey } from "~Utils/CacheKeyUtils/CacheKeyUtils"
import { initEncryption } from "~Services/EncryptionService"
import { CryptoUtils, error } from "~Utils"
import { CACHE_METADATA_KEY } from "./constants"

const config: MMKVConfiguration = { id: "cache-metadata" }
const _cache = new MMKV(config)

let encrKey: string | undefined

const initKey = () => {
    initEncryption(CACHE_METADATA_KEY)
        .then(key => (encrKey = key))
        .catch(err => error("Failed to init encryption key", err))
}

initKey()

const setItem = (itemKey: string, value: TokenMetadata): void => {
    if (!encrKey) throw Error("Encryption key not initialized")
    _cache.set(
        createKey(itemKey),
        CryptoUtils.encryptState<TokenMetadata>(value, encrKey),
    )
}
const getItem = (itemKey: string): TokenMetadata | undefined => {
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

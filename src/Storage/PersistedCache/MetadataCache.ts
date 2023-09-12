import { MMKV, MMKVConfiguration } from "react-native-mmkv"
import { createKey } from "~Utils/CacheKeyUtils/CacheKeyUtils"
import { initEncryption } from "~Services/EncryptionService"
import { CryptoUtils, error } from "~Utils"
import { CACHE_NFT_METADATA_KEY } from "./constants"
import { NFTMetadata } from "~Model"

const config: MMKVConfiguration = { id: "cache-metadata" }
const _cache = new MMKV(config)

let encrKey: string | undefined

const initKey = () => {
    initEncryption(CACHE_NFT_METADATA_KEY)
        .then(key => (encrKey = key))
        .catch(err => error("Failed to init encryption key", err))
}

initKey()

const setItem = (itemKey: string, value: NFTMetadata): void => {
    if (!encrKey) throw Error("Encryption key not initialized")
    _cache.set(
        createKey(itemKey),
        CryptoUtils.encryptState<NFTMetadata>(value, encrKey),
    )
}
const getItem = (itemKey: string): NFTMetadata | undefined => {
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

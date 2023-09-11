import { TokenMedia, TokenMetadata } from "~Model"
import { SynchronousCache } from "./interface"
import SecurePersistedCache from "./SecurePersistedCache"
import { CACHE_TOKEN_MEDIA_KEY, CACHE_TOKEN_METADATA_KEY } from "./constants"
import { initEncryption } from "~Services/EncryptionService"

export let TokenMetadataCache: SynchronousCache<TokenMetadata>
export let TokenMediaCache: SynchronousCache<TokenMedia>

export const initTokenMetadataCache = async () => {
    TokenMetadataCache = new SecurePersistedCache<TokenMetadata>(
        CACHE_TOKEN_METADATA_KEY,
        await initEncryption(CACHE_TOKEN_METADATA_KEY),
    )
}

export const initTokenMediaCache = async () => {
    TokenMediaCache = new SecurePersistedCache<TokenMedia>(
        CACHE_TOKEN_MEDIA_KEY,
        await initEncryption(CACHE_TOKEN_MEDIA_KEY),
    )
}

initTokenMetadataCache()
initTokenMediaCache()

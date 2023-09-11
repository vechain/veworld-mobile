import { NFTMedia, NFTMetadata } from "~Model"
import { SynchronousCache } from "./interface"
import SecurePersistedCache from "./SecurePersistedCache"
import { CACHE_NFT_MEDIA_KEY, CACHE_NFT_METADATA_KEY } from "./constants"
import { initEncryption } from "~Services/EncryptionService"

export let TokenMetadataCache: SynchronousCache<NFTMetadata>
export let TokenMediaCache: SynchronousCache<NFTMedia>

export const initNFTMetadataCache = async () => {
    TokenMetadataCache = new SecurePersistedCache<NFTMetadata>(
        CACHE_NFT_METADATA_KEY,
        await initEncryption(CACHE_NFT_METADATA_KEY),
    )
}

export const initNFTMediaCache = async () => {
    TokenMediaCache = new SecurePersistedCache<NFTMedia>(
        CACHE_NFT_MEDIA_KEY,
        await initEncryption(CACHE_NFT_MEDIA_KEY),
    )
}

initNFTMetadataCache()
initNFTMediaCache()

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { NFTMedia, NFTMetadata } from "~Model"
import { initEncryption } from "~Services/EncryptionService"
import SecurePersistedCache from "~Storage/PersistedCache/SecurePersistedCache"
import {
    CACHE_NFT_MEDIA_KEY,
    CACHE_NFT_METADATA_KEY,
} from "~Storage/PersistedCache/constants"
import { SynchronousCache } from "~Storage/PersistedCache/interface"

type CacheProvider = {
    metadataCache: SynchronousCache<NFTMetadata>
    mediaCache: SynchronousCache<NFTMedia>
    initAllCaches: () => Promise<void>
    resetAllCaches: () => Promise<void>
}

const CacheContext = React.createContext<CacheProvider | undefined>(undefined)

type PersistedCacheProviderProps = { children: React.ReactNode }

const PersistedCacheProvider = ({ children }: PersistedCacheProviderProps) => {
    const [metadataCache, setMetadataCache] =
        useState<SynchronousCache<NFTMetadata>>()
    const [mediaCache, setMediaCache] = useState<SynchronousCache<NFTMedia>>()

    const initNFTMetadataCache = useCallback(async () => {
        setMetadataCache(
            new SecurePersistedCache<NFTMetadata>(
                CACHE_NFT_METADATA_KEY,
                await initEncryption(CACHE_NFT_METADATA_KEY),
            ),
        )
    }, [])

    const initNFTMediaCache = useCallback(async () => {
        setMediaCache(
            new SecurePersistedCache<NFTMedia>(
                CACHE_NFT_MEDIA_KEY,
                await initEncryption(CACHE_NFT_MEDIA_KEY),
            ),
        )
    }, [])

    const init = useCallback(async () => {
        await initNFTMetadataCache()
        await initNFTMediaCache()
    }, [initNFTMediaCache, initNFTMetadataCache])

    const reset = useCallback(async () => {
        metadataCache?.reset()
        mediaCache?.reset()
    }, [mediaCache, metadataCache])

    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const value = useMemo(() => {
        if (metadataCache && mediaCache)
            return {
                metadataCache,
                mediaCache,
                initAllCaches: init,
                resetAllCaches: reset,
            }

        return undefined
    }, [init, reset, metadataCache, mediaCache])

    if (!value) {
        return <></>
    }

    return (
        <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
    )
}

const usePersistedCache = () => {
    const context = React.useContext(CacheContext)
    if (!context) {
        throw new Error(
            "usePersistedCache must be used within a PersistedCacheProvider",
        )
    }

    return context
}

export { usePersistedCache, PersistedCacheProvider }

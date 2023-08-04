import axios from "axios"
import { useCallback } from "react"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { TokenMetadata } from "~Model"
import { getTokenMetaArweave, getTokenMetaIpfs } from "~Networking"
import {
    addMetadataEntry,
    selectEntryFromMetadataCache,
    selectMetadataCacheState,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { debug, warn } from "~Utils"

enum URIProtocol {
    IPFS = "ipfs",
    ARWEAVE = "ar",
    HTTPS = "https",
}

export const useTokenMetadata = () => {
    const dispatch = useAppDispatch()
    const metadata = useAppSelector(selectMetadataCacheState)

    const fetchMetadata = useCallback(
        async (uri: string) => {
            debug(`Fetching metadata for ${uri}`)

            try {
                const protocol = uri?.split(":")[0]

                switch (protocol) {
                    case URIProtocol.IPFS:
                    case URIProtocol.ARWEAVE: {
                        const cachedData = selectEntryFromMetadataCache(
                            metadata,
                            uri,
                        )
                        if (cachedData) return cachedData

                        const retrievedData = URIProtocol.IPFS
                            ? await getTokenMetaIpfs(uri)
                            : await getTokenMetaArweave(uri)

                        dispatch(
                            addMetadataEntry({
                                seed: uri,
                                value: retrievedData,
                            }),
                        )
                        return retrievedData
                    }

                    case URIProtocol.HTTPS: {
                        return (
                            (
                                await axios.get<TokenMetadata>(uri, {
                                    timeout: NFT_AXIOS_TIMEOUT,
                                })
                            )?.data ?? undefined
                        )
                    }

                    default:
                        warn(
                            `Unable to detect protocol for metadata URI ${uri}`,
                        )
                        return undefined
                }
            } catch (e) {
                warn(`Error fetching metadata ${uri}`, e)
            }
        },
        [dispatch, metadata],
    )

    return {
        fetchMetadata,
    }
}

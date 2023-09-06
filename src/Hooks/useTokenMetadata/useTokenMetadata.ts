import axios from "axios"
import { useCallback } from "react"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { URIProtocol } from "~Constants/Enums/URIProtocol"
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

export const useTokenMetadata = () => {
    const dispatch = useAppDispatch()
    const metadata = useAppSelector(selectMetadataCacheState)

    const fetchMetadata = useCallback(
        async (uri: string) => {
            try {
                const protocol = uri?.split(":")[0].trim()

                switch (protocol) {
                    case URIProtocol.IPFS:
                    case URIProtocol.ARWEAVE: {
                        const cachedData = selectEntryFromMetadataCache(
                            metadata,
                            uri,
                        )
                        if (cachedData) {
                            debug(`Using cached metadata for ${uri}`)
                            return cachedData
                        }

                        debug(`Fetching metadata for ${uri}`)
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
                        debug(`Fetching metadata for ${uri}`)
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

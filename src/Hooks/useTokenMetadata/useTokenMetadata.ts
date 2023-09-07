import axios from "axios"
import { useCallback } from "react"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { TokenMetadata } from "~Model"
import { getTokenMetaArweave, getTokenMetaIpfs } from "~Networking"
import { debug, warn } from "~Utils"
import { MMKV } from "react-native-mmkv"

const metadataStorage = new MMKV({ id: "ipfs-cache" })

export const useTokenMetadata = () => {
    const fetchMetadata = useCallback(
        async (uri: string): Promise<TokenMetadata | undefined> => {
            try {
                const protocol = uri?.split(":")[0].trim()

                switch (protocol) {
                    case URIProtocol.IPFS:
                    case URIProtocol.ARWEAVE: {
                        const cachedData = metadataStorage.getString(uri)

                        if (cachedData) {
                            debug(`Using cached metadata for ${uri}`)
                            return JSON.parse(cachedData)
                        }

                        debug(`Fetching metadata for ${uri}`)
                        const retrievedData = URIProtocol.IPFS
                            ? await getTokenMetaIpfs(uri)
                            : await getTokenMetaArweave(uri)

                        metadataStorage.set(uri, JSON.stringify(retrievedData))

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
        [],
    )

    return {
        fetchMetadata,
    }
}

import { DataTag, queryOptions, UnusedSkipTokenOptions } from "@tanstack/react-query"
import axios from "axios"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { NFTMetadata } from "~Model"
import ArweaveUtils from "~Utils/ArweaveUtils"
import IPFSUtils from "~Utils/IPFSUtils"

const getProtocolFromUri = (uri?: string) => {
    const protocol = uri?.split(":")[0].trim()
    switch (protocol) {
        case URIProtocol.IPFS:
        case URIProtocol.ARWEAVE:
        case URIProtocol.HTTP:
        case URIProtocol.HTTPS:
            return protocol as URIProtocol
        default:
            return "UNKNOWN"
    }
}

export const getCollectibleMetadataOptions = (
    uri: string | undefined,
    /**
     * Indicate that the token uri is loading
     */
    isLoading?: boolean,
): UnusedSkipTokenOptions<NFTMetadata | null, Error, NFTMetadata | null, (string | undefined)[]> & {
    queryKey: DataTag<(string | undefined)[], NFTMetadata | null, Error>
} => {
    const protocol = getProtocolFromUri(uri)

    const enabled = !!uri && !isLoading

    switch (protocol) {
        case URIProtocol.IPFS:
            return {
                ...IPFSUtils.getIpfsQueryKeyOptions<NFTMetadata | null>(uri, {
                    responseType: "json",
                    timeout: NFT_AXIOS_TIMEOUT,
                }),
                enabled,
            }
        case URIProtocol.ARWEAVE:
            return {
                ...ArweaveUtils.getArweaveQueryKeyOptions<NFTMetadata | null>(uri, { responseType: "json" }),
                enabled,
            }
        case URIProtocol.HTTPS:
        case URIProtocol.HTTP:
            return queryOptions({
                queryKey: ["HTTPS_URI", "v1", uri],
                queryFn: () =>
                    axios
                        .get<NFTMetadata>(uri!, {
                            timeout: NFT_AXIOS_TIMEOUT,
                        })
                        .then(res => res.data),
                staleTime: 5 * 60 * 1000,
                enabled,
            })
        case URIProtocol.DATA:
        case "UNKNOWN":
            return queryOptions<NFTMetadata | null, Error, NFTMetadata | null, (string | undefined)[]>({
                queryKey: ["UNKNOWN_URI", "v1", uri],
                queryFn: () => null,
                staleTime: 5 * 60 * 1000,
                enabled,
            })
    }
}

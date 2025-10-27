import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useMemo } from "react"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { URIProtocol } from "~Constants/Enums/URIProtocol"
import { NFTMetadata } from "~Model"
import ArweaveUtils from "~Utils/ArweaveUtils"
import IPFSUtils from "~Utils/IPFSUtils"
import { useTokenURI } from "./useTokenURI"

const metadataParser = (value: NFTMetadata | undefined) => {
    if (!value) return undefined
    return Object.keys(value).reduce((acc: any, key) => {
        acc[key.toLowerCase()] = value?.[key as keyof NFTMetadata]
        return acc
    }, {}) as NFTMetadata
}

export const useCollectibleMetadata = ({ address, tokenId }: { address: string; tokenId: string }) => {
    const { data: uri, isLoading } = useTokenURI({ address, tokenId })

    const uriProtocol = useMemo(() => {
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
    }, [uri])

    const ipfsMetadataProps = useQuery({
        ...IPFSUtils.getIpfsQueryKeyOptions<NFTMetadata>(uri, {
            responseType: "json",
            timeout: NFT_AXIOS_TIMEOUT,
        }),
        enabled: !!uri && uriProtocol === URIProtocol.IPFS,
    })
    const arweaveMetadataProps = useQuery({
        ...ArweaveUtils.getArweaveQueryKeyOptions<NFTMetadata>(uri, { responseType: "json" }),
        enabled: !!uri && uriProtocol === URIProtocol.ARWEAVE,
    })
    const httpsMetadataProps = useQuery({
        queryKey: ["HTTPS_URI", "v1", uri],
        queryFn: () =>
            axios
                .get<NFTMetadata>(uri!, {
                    timeout: NFT_AXIOS_TIMEOUT,
                })
                .then(res => res.data),
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        enabled: !!uri && [URIProtocol.HTTP, URIProtocol.HTTPS].includes(uriProtocol as URIProtocol),
    })

    return useMemo(() => {
        switch (uriProtocol) {
            case URIProtocol.IPFS:
                return { ...ipfsMetadataProps, data: metadataParser(ipfsMetadataProps.data) }
            case URIProtocol.ARWEAVE:
                return { ...arweaveMetadataProps, data: metadataParser(arweaveMetadataProps.data) }
            case URIProtocol.HTTPS:
            case URIProtocol.HTTP:
                return { ...httpsMetadataProps, data: metadataParser(httpsMetadataProps.data) }
            case URIProtocol.DATA:
            case "UNKNOWN":
                //Return a random one
                return { ...ipfsMetadataProps, isLoading, data: metadataParser(ipfsMetadataProps.data) }
        }
    }, [arweaveMetadataProps, httpsMetadataProps, ipfsMetadataProps, isLoading, uriProtocol])
}

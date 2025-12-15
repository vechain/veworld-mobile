import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { NFTMetadata } from "~Model"
import { getCollectibleMetadataOptions } from "./getCollectibleMetadataOptions"
import { useTokenURI } from "./useTokenURI"

const metadataParser = (value: NFTMetadata | undefined | null) => {
    if (!value) return undefined
    return Object.keys(value).reduce((acc: any, key) => {
        acc[key.toLowerCase()] = value?.[key as keyof NFTMetadata]
        return acc
    }, {}) as NFTMetadata
}

export const useCollectibleMetadata = ({
    address,
    tokenId,
    blockNumber,
}: {
    address: string | undefined
    tokenId: string | undefined
    /**
     * Number of the block used to get the Token URI
     * Pass it only when the token is burnt and the token URI throws
     */
    blockNumber?: number
}) => {
    const { data: uri, isLoading } = useTokenURI({ address, tokenId, blockNumber })

    const options = useMemo(
        () => ({
            ...getCollectibleMetadataOptions(uri, isLoading),
            select(data: NFTMetadata | null) {
                return metadataParser(data)
            },
        }),
        [isLoading, uri],
    )

    return useQuery(options)
}

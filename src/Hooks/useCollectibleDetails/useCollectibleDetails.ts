import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useCollectibleMetadata } from "~Hooks/useCollectibleMetadata"
import { useThorClient } from "~Hooks/useThorClient"
import { getNftNameAndSymbolOptions } from "~Networking/NFT/getNftCollectionMetadata"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

type Args = {
    address: string | undefined
    tokenId: string | undefined
    /**
     * Number of the block used to get the Token URI
     * Pass it only when the token is burnt and the token URI throws
     */
    blockNumber?: number
}

export const useCollectibleDetails = ({ address, tokenId, blockNumber }: Args) => {
    const thor = useThorClient()
    const network = useAppSelector(selectSelectedNetwork)
    const { data } = useCollectibleMetadata({ address, tokenId, blockNumber })
    const { data: collectionMetadata } = useQuery(getNftNameAndSymbolOptions(address, network.genesis.id, thor))

    const name = useMemo(() => {
        return data?.name ?? collectionMetadata?.name
    }, [collectionMetadata?.name, data])

    return useMemo(() => {
        return {
            ...data,
            name,
            collectionName: collectionMetadata?.name,
        }
    }, [collectionMetadata?.name, data, name])
}

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useCollectibleMetadata } from "~Hooks/useCollectibleMetadata"
import { useThorClient } from "~Hooks/useThorClient"
import { getNftNameAndSymbolOptions } from "~Networking/NFT/getNftCollectionMetadata"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

type Args = {
    address: string
    tokenId: string
}

export const useCollectibleDetails = ({ address, tokenId }: Args) => {
    const thor = useThorClient()
    const network = useAppSelector(selectSelectedNetwork)
    const { data } = useCollectibleMetadata({ address, tokenId })
    const { data: collectionMetadata } = useQuery(getNftNameAndSymbolOptions(address, network.genesis.id, thor))

    const name = useMemo(() => {
        return data?.name ?? collectionMetadata?.name
    }, [collectionMetadata?.name, data])

    return useMemo(() => {
        return {
            ...data,
            name,
        }
    }, [data, name])
}

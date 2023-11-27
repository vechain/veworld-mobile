import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useCallback, useEffect, useState } from "react"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"
import { marketplaceMapping } from "~Constants/Constants/DApps/nfts/market-place-ids"
import axios from "axios"

type NFT = {
    name: string
    address: string
    description: string
    icon: string
    marketplaces: [
        {
            name: string
            link: string
        },
    ]
}

export type ExpandedNFT = NFT & {
    marketplaceLink?: string
    imageUrl: string
}

const getNfts = async (network: "main" | "test") => {
    const res = await axios.get<NFT[]>(`https://vechain.github.io/nft-registry/${network}.json`)

    return res.data
}

const PAGE_SIZE = 10
export const useNftDiscovery = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [nfts, setNfts] = useState<ExpandedNFT[]>([])
    const [paginatedNfts, setPaginatedNfts] = useState<ExpandedNFT[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const processNfts = useCallback((_nfts: NFT[]) => {
        const expandedNfts: ExpandedNFT[] = _nfts.map((nft: NFT) => {
            const _address = nft.address.toLowerCase()
            const imageUrl = `https://vechain.github.io/nft-registry/${nft.icon}`
            // const imageUrl = `https://vechain.github.io/nft-registry/assets/${nft.address}.webp`
            const marketPlaceId = marketplaceMapping[_address]

            let marketplaceLink: string | undefined

            if (marketPlaceId?.worldofv) marketplaceLink = `https://worldofv.art/collection/${marketPlaceId.worldofv}`
            else if (marketPlaceId?.vesea) marketplaceLink = `https://www.vesea.io/collections/${marketPlaceId.vesea}`
            else if (nft.marketplaces.length) marketplaceLink = nft.marketplaces[0].link

            return {
                ...nft,
                imageUrl,
                marketplaceLink,
            }
        })

        setNfts(expandedNfts)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        setNfts([])
        setPaginatedNfts([])
        setIsLoading(true)
        if (network.genesis.id === defaultMainNetwork.genesis.id) {
            getNfts("main").then(processNfts)
        } else if (network.genesis.id === defaultTestNetwork.genesis.id) {
            getNfts("test").then(processNfts)
        }
    }, [processNfts, network])

    useEffect(() => {
        setPaginatedNfts(nfts.slice(0, page * PAGE_SIZE))
    }, [nfts, page])

    useEffect(() => {
        setHasMore(nfts.length > page * PAGE_SIZE)
    }, [nfts, page])

    return {
        paginatedNfts,
        loadMore: () => setPage(_page => _page + 1),
        hasMore,
        isLoading,
    }
}

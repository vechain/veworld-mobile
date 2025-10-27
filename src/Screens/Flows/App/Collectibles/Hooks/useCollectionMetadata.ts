import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
import { ERROR_EVENTS } from "~Constants"
import { initCollectionMetadataFromRegistry, initCollectionMetadataWithoutRegistry } from "~Hooks/useNft/Helpers"
import { useNFTRegistry } from "~Hooks/useNft/useNFTRegistry"
import { useNFTMetadata } from "~Hooks/useNFTMetadata"
import { useThorClient } from "~Hooks/useThorClient"
import { Network, NftCollection, NFTMetadata } from "~Model"
import { GithubCollectionResponse } from "~Networking"
import { getCachedTokenURI, getCachedNftBalanceOf, getNftsForContract } from "~Networking/NFT"
import { getNftCollectionMetadata } from "~Networking/NFT/getNftCollectionMetadata"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import AddressUtils from "~Utils/AddressUtils"
import { warn } from "~Utils/Logger"

const getCollectionMetadataQueryKey = (
    collectionAddress: string,
    genesisId: string,
    accountAddress: string,
): string[] => ["COLLECTIBLES", "COLLECTION_METADATA", collectionAddress, genesisId, accountAddress]

const getCollectionMetadata = async (
    collectionAddress: string,
    network: Network,
    address: string,
    registryInfo: GithubCollectionResponse[],
    thor: ThorClient,
    fetchMetadata: (uri: string) => Promise<NFTMetadata | undefined>,
) => {
    const regInfo = registryInfo.find(col => AddressUtils.compareAddresses(col.address, collectionAddress))

    let collection: NftCollection

    if (regInfo) {
        collection = initCollectionMetadataFromRegistry(network.type, address, collectionAddress, regInfo)
    } else {
        collection = initCollectionMetadataWithoutRegistry(network.type, address, collectionAddress, "Not available")
    }

    let balanceOf: number | undefined

    try {
        balanceOf = await getCachedNftBalanceOf(address, collectionAddress, thor)
    } catch (e) {
        warn(ERROR_EVENTS.NFT, "failed to get balance", e)
    }

    let image = collection.image
    let description = collection.description
    if (!collection.fromRegistry) {
        const { data } = await getNftsForContract(network.type, collectionAddress, address, 1, 0)

        const tokenURI = await getCachedTokenURI(data[0].tokenId, collectionAddress, network.genesis.id, thor)
        const tokenMetadata = await fetchMetadata(tokenURI)

        if (tokenMetadata) {
            image = tokenMetadata.image
            description = tokenMetadata.description
        }
    }
    const { name, symbol, totalSupply } = await getNftCollectionMetadata(collection.address, network.genesis.id, thor)

    const updatedCollection: NftCollection = {
        ...collection,
        balanceOf: balanceOf,
        image,
        name: name ?? collection.name,
        description,
        updated: true,
        symbol,
        totalSupply: totalSupply ? Number(totalSupply) : undefined,
    }

    return updatedCollection
}

export const useCollectionMetadata = (collectionAddress: string) => {
    const thor = useThorClient()
    const { fetchMetadata } = useNFTMetadata()
    const { data: registryInfo } = useNFTRegistry()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    return useQuery({
        queryKey: getCollectionMetadataQueryKey(collectionAddress, network.genesis.id, selectedAccount.address),
        queryFn: () =>
            getCollectionMetadata(
                collectionAddress,
                network,
                selectedAccount.address,
                registryInfo!,
                thor,
                fetchMetadata,
            ),
        enabled: !!collectionAddress && !!registryInfo && !!thor,
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: Infinity,
    })
}

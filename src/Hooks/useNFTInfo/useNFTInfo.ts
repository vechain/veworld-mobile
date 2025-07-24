import { useEffect, useState } from "react"
import { ERROR_EVENTS } from "~Constants"
import { useNFTMetadata } from "~Hooks"
import { useThorClient } from "~Hooks/useThorClient"
import { NFTMetadata } from "~Model"
import { getName, getTokenURI } from "~Networking"
import { warn } from "~Utils"

/**
 * `useNFTInfo` is a hook for fetching and managing non-fungible token (NFT) information.
 *
 * @param {string} tokenId - The identifier of the non-fungible token.
 * @param {string} contractAddress - The contract address of the non-fungible token.
 *
 * @returns {Object} The hook returns an object with the following properties:
 *
 * - `tokenMetadata`: Contains metadata of the NFT. Can be undefined if metadata is not retrieved yet or there was an error.
 * - `collectionName`: The name of the collection the NFT belongs to. Can be undefined if name is not retrieved yet or there was an error.
 * - `isMediaLoading`: A boolean indicating whether the media (metadata, URI, name, image, MIME type) is currently loading.
 *
 * @example
 *
 * const { tokenMetadata, tokenUri, collectionName, tokenImage, tokenMime, isMediaLoading } = useNFTInfo(tokenId, contractAddress);
 *
 */
export const useNFTInfo = (tokenId: string, contractAddress: string) => {
    const { fetchMetadata } = useNFTMetadata()
    const [tokenMetadata, setTokenMetadata] = useState<NFTMetadata | undefined>()
    const [collectionName, setCollectionName] = useState<string | undefined>()

    const [isMediaLoading, setIsMediaLoading] = useState<boolean>(true)

    const thor = useThorClient()

    useEffect(() => {
        const load = async () => {
            try {
                const name = await getName(contractAddress, thor)
                setCollectionName(name)
                const uri = await getTokenURI(tokenId, contractAddress, thor)
                const metadata = await fetchMetadata(uri)
                if (!metadata) throw Error("No metadata found")

                setTokenMetadata(metadata)
            } catch (e) {
                warn(ERROR_EVENTS.NFT, `Failed to load NFT token info ${tokenId} of collection ${contractAddress}`)
            } finally {
                setIsMediaLoading(false)
            }
        }
        if (tokenId && contractAddress && thor) load()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenId, contractAddress, thor])

    return {
        tokenMetadata,
        collectionName,
        isMediaLoading,
    }
}

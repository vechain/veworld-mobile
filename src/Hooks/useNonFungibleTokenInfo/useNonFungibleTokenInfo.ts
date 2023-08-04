import { useEffect, useState } from "react"
import { useThor } from "~Components"
import { useTokenMetadata } from "~Hooks/useTokenMetadata"
import { NFTMediaType, TokenMetadata } from "~Model"
import { getName, getTokenURI } from "~Networking"
import { MediaUtils, URIUtils, error } from "~Utils"

/**
 * `useNonFungibleTokenInfo` is a hook for fetching and managing non-fungible token (NFT) information.
 *
 * @param {string} tokenId - The identifier of the non-fungible token.
 * @param {string} contractAddress - The contract address of the non-fungible token.
 *
 * @returns {Object} The hook returns an object with the following properties:
 *
 * - `tokenMetadata`: Contains metadata of the NFT. Can be undefined if metadata is not retrieved yet or there was an error.
 * - `tokenUri`: The URI of the token. Can be undefined if URI is not retrieved yet or there was an error.
 * - `collectionName`: The name of the collection the NFT belongs to. Can be undefined if name is not retrieved yet or there was an error.
 * - `tokenImage`: The image URL of the token. Can be undefined if image URL is not retrieved yet or there was an error.
 * - `tokenMime`: The MIME type of the token's image. Defaults to 'image/png' if not retrieved or there was an error.
 * - `isMediaLoading`: A boolean indicating whether the media (metadata, URI, name, image, MIME type) is currently loading.
 *
 * @example
 *
 * const { tokenMetadata, tokenUri, collectionName, tokenImage, tokenMime, isMediaLoading } = useNonFungibleTokenInfo(tokenId, contractAddress);
 *
 */
export const useNonFungibleTokenInfo = (
    tokenId: string,
    contractAddress: string,
) => {
    const { fetchMetadata } = useTokenMetadata()
    const [tokenUri, setTokenUri] = useState<string | undefined>()
    const [tokenMetadata, setTokenMetadata] = useState<
        TokenMetadata | undefined
    >()
    const [tokenImage, setTokenImage] = useState<string | undefined>()
    const [tokenMediaType, setTokenMediaType] = useState(NFTMediaType.UNKNOWN)
    const [collectionName, setCollectionName] = useState<string | undefined>()

    const [isMediaLoading, setIsMediaLoading] = useState<boolean>(true)

    const thor = useThor()

    useEffect(() => {
        const load = async () => {
            try {
                const name = await getName(contractAddress, thor)
                setCollectionName(name)
                const uri = await getTokenURI(tokenId, contractAddress, thor)
                setTokenUri(uri)
                const metadata = await fetchMetadata(uri)
                if (!metadata) throw new Error("No metadata found")
                setTokenMetadata(metadata)
                const mediaType = await MediaUtils.resolveMediaType(
                    metadata.image,
                )

                setTokenMediaType(mediaType)
                setTokenImage(URIUtils.convertUriToUrl(metadata?.image))
                setIsMediaLoading(false)
            } catch (e) {
                error(
                    `Failed to load metadata for token ${tokenId} of collection ${contractAddress}`,
                )
                setIsMediaLoading(false)
            }
        }
        if (tokenId && contractAddress && thor) load()
    }, [tokenId, contractAddress, thor, fetchMetadata])

    return {
        tokenMetadata,
        tokenUri,
        collectionName,
        tokenImage,
        tokenMediaType,
        isMediaLoading,
    }
}

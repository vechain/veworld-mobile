import { useEffect, useState } from "react"
import { useThor } from "~Components"
import { fetchMetadata } from "~Hooks/useNft/fetchMeta"
import { TokenMetadata } from "~Model"
import { getName, getTokenURI } from "~Networking"
import { URIUtils, error } from "~Utils"
import { resolveMimeType } from "~Utils/MediaUtils/MediaUtils"

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
    const [tokenUri, setTokenUri] = useState<string | undefined>()
    const [tokenMetadata, setTokenMetadata] = useState<
        TokenMetadata | undefined
    >()
    const [tokenImage, setTokenImage] = useState<string | undefined>()
    const [tokenMime, setTokenMime] = useState<string | undefined>()
    const [collectionName, setCollectionName] = useState<string | undefined>()

    const [isMediaLoading, setIsMediaLoading] = useState<boolean>(true)

    const thor = useThor()

    useEffect(() => {
        const load = async () => {
            try {
                const name = await getName(contractAddress, thor)
                const uri = await getTokenURI(tokenId, contractAddress, thor)
                const metadata = await fetchMetadata(uri)
                if (!metadata) throw new Error("No metadata found")
                const mimeType = await resolveMimeType(metadata?.image)
                setTokenImage(URIUtils.convertUriToUrl(metadata?.image))
                setTokenMetadata(metadata)
                setTokenUri(uri)
                setTokenMime(mimeType)
                setCollectionName(name)
                setIsMediaLoading(false)
            } catch (e) {
                error(
                    `Failed to load metadata for token ${tokenId} of collection ${contractAddress}`,
                )
                setIsMediaLoading(false)
            }
        }
        if (tokenId && contractAddress && thor) load()
    }, [tokenId, contractAddress, thor])

    return {
        tokenMetadata,
        tokenUri,
        collectionName,
        tokenImage,
        tokenMime,
        isMediaLoading,
    }
}

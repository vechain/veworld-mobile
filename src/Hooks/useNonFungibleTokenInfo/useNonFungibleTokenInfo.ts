/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import { useThor } from "~Components"
import { resolveMimeType } from "~Hooks/useNft/Helpers"
import { fetchMetadata } from "~Hooks/useNft/fetchMeta"
import { TokenMetadata } from "~Model"
import { getName, getTokenURI } from "~Networking"
import { error } from "~Utils"

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
    tokenId?: string,
    contractAddress?: string,
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
        if (contractAddress && tokenId) {
            getTokenURI(tokenId, contractAddress, thor)
                .then(tknUri => {
                    tknUri ? setTokenUri(tknUri) : setIsMediaLoading(false)
                })
                .catch(e => {
                    error("Failed to get token URI for ID: " + tokenId, e)

                    setIsMediaLoading(false)
                })
        }
    }, [tokenId, contractAddress])

    useEffect(() => {
        if (contractAddress && !collectionName)
            getName(contractAddress, thor)
                .then(name =>
                    name ? setCollectionName(name) : setIsMediaLoading(false),
                )
                .catch(e => {
                    error(
                        "Failed to get collection name for address: " +
                            contractAddress,
                        e,
                    )

                    setIsMediaLoading(false)
                })
    }, [contractAddress])

    useEffect(() => {
        if (tokenUri)
            fetchMetadata(tokenUri)
                .then((metadata?: TokenMetadata) => {
                    setTokenMetadata(metadata)
                    setTokenImage(metadata?.image)

                    setIsMediaLoading(false)
                })
                .catch(e => {
                    error("Failed to get token Metadata for ID: " + tokenId, e)

                    setIsMediaLoading(false)
                })
    }, [tokenUri])

    useEffect(() => {
        if (tokenMetadata && tokenMetadata.image) {
            resolveMimeType(tokenMetadata.image).then(mime =>
                setTokenMime(mime),
            )
        }
    }, [tokenMetadata])
    return {
        tokenMetadata,
        tokenUri,
        collectionName,
        tokenImage,
        tokenMime,
        isMediaLoading,
    }
}

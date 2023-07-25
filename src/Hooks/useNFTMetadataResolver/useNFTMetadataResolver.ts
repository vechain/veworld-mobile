import { useEffect, useState } from "react"
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"
import { useThor } from "~Components"
import { useMimeTypeResolver } from "~Hooks/useMimeTypeResolver"
import { fetchMetadata } from "~Hooks/useNft/fetchMeta"
import { ERC721Metadata, NFTMediaType } from "~Model"
import { getNftsForContract, getTokenURI } from "~Networking"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { URIUtils } from "~Utils"

type Props<T> = { nft: T }

type Response<T> = {
    mediaType: NFTMediaType
    nftWithMetadata: T
}

const isDefaultImage = (image: string): boolean =>
    image === NFTPlaceholderDark || image === NFTPlaceHolderLight

export const useNFTMetadataResolver = <T extends ERC721Metadata>({
    nft,
}: Props<T>): Response<T> => {
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const thor = useThor()

    const [description, setDescription] = useState(nft.description)
    const [image, setImage] = useState(nft.image)

    const mediaType = useMimeTypeResolver({
        imageUrl: image,
        mimeType: nft.mimeType,
    })

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await getNftsForContract(
                network.type,
                nft.address,
                selectedAccount.address,
                1,
                0,
            )

            const tokenURI = await getTokenURI(
                data[0].tokenId,
                nft.address,
                thor,
            )
            const tokenMetadata = await fetchMetadata(tokenURI)

            if (tokenMetadata?.description)
                setDescription(tokenMetadata.description)
            if (tokenMetadata?.image)
                setImage(URIUtils.convertUriToUrl(tokenMetadata.image))
        }
        if (thor && network && selectedAccount && isDefaultImage(nft.image))
            fetchData()
    }, [thor, network, selectedAccount, nft])

    return {
        mediaType,
        nftWithMetadata: { ...nft, description, image } as T,
    }
}

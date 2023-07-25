import { useEffect, useState } from "react"
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"
import { useThor } from "~Components"
import { fetchMetadata } from "~Hooks/useNft/fetchMeta"
import { NonFungibleTokenCollection } from "~Model"
import { getNftsForContract, getTokenURI } from "~Networking"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { URIUtils } from "~Utils"

type Props = { collection: NonFungibleTokenCollection }

const isDefaultImage = (image: string): boolean =>
    image === NFTPlaceholderDark || image == NFTPlaceHolderLight

export const useCollectionMetadataResolver = ({ collection }: Props) => {
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const thor = useThor()

    const [description, setDescription] = useState(collection.description)
    const [image, setImage] = useState(collection.image)

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await getNftsForContract(
                network.type,
                collection.address,
                selectedAccount.address,
                1,
                0,
            )

            const tokenURI = await getTokenURI(
                data[0].tokenId,
                collection.address,
                thor,
            )
            const tokenMetadata = await fetchMetadata(tokenURI)

            if (tokenMetadata?.description)
                setDescription(tokenMetadata.description)
            if (tokenMetadata?.image)
                setImage(URIUtils.convertUriToUrl(tokenMetadata.image))
        }
        if (
            thor &&
            network &&
            selectedAccount &&
            isDefaultImage(collection.image)
        )
            fetchData()
    }, [thor, network, selectedAccount, collection])

    return { ...collection, description, image } as NonFungibleTokenCollection
}

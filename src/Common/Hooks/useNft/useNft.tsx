import { useCallback, useEffect, useState } from "react"
import { useNftContract } from "./useNftContract"
import { error as logError } from "~Common/Logger"
import { useI18nContext } from "~i18n"
import { NonFungibleTokenCollection, NonFungibleToken } from "~Model/Nft/Nft"
import {
    getTokenMetaIpfs,
    getImageUrlIpfs,
    getTokenMetaArweave,
    getImageUrlArweave,
} from "~Networking"
import { setNfts, useAppDispatch } from "../../../Storage/Redux"
import { NFTPlaceholder } from "~Assets"
import { isEmpty } from "lodash"

enum URIProtocol {
    IPFS = "ipfs",
    ARWEAVE = "ar",
}

export const useNft = () => {
    const [error, setError] = useState<string | undefined>(undefined)
    const { nftCollections } = useNftContract()
    const { LL } = useI18nContext()
    const disptach = useAppDispatch()

    const fetchMetadata = useCallback(
        async (uri: string) => {
            try {
                const protocol = uri.split(":")[0]

                switch (protocol) {
                    case URIProtocol.IPFS: {
                        const tokenMetadata = await getTokenMetaIpfs(uri)
                        const imageUrl = getImageUrlIpfs(
                            tokenMetadata.image ?? "",
                        )
                        return { tokenMetadata, imageUrl }
                    }

                    case URIProtocol.ARWEAVE: {
                        const tokenMetadata = await getTokenMetaArweave(uri)
                        const imageUrl = await getImageUrlArweave(uri)
                        return { tokenMetadata, imageUrl }
                    }

                    default:
                        setError(
                            LL.ERROR_NFT_TOKEN_URI_PROTOCOL_NOT_SUPPORTED({
                                protocol,
                            }),
                        )
                }
            } catch (e) {
                logError(e)
                setError(LL.ERROR_NFT_FAILED_TO_GET_METADATA())
            }
        },
        [LL],
    )

    useEffect(() => {
        const init = async () => {
            let _collectionFinal: NonFungibleTokenCollection[] = []

            for (const collection of nftCollections) {
                let _nftFinal: NonFungibleToken[] = []

                for (const nft of collection.nfts) {
                    if (nft.tokenURI) {
                        const nftMeta = await fetchMetadata(nft.tokenURI)
                        const _nft = {
                            ...nft,
                            ...nftMeta?.tokenMetadata,
                            image: nftMeta?.imageUrl ?? NFTPlaceholder,
                        }

                        _nftFinal.push(_nft)

                        if (isEmpty(collection.icon))
                            collection.icon =
                                nftMeta?.imageUrl ?? NFTPlaceholder
                    }
                }

                const col = {
                    ...collection,
                    nfts: _nftFinal,
                }

                _collectionFinal.push(col)
            }

            disptach(setNfts(_collectionFinal))
        }

        init()
    }, [disptach, fetchMetadata, nftCollections])

    return { error }
}

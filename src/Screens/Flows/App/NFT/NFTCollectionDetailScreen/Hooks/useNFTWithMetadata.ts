import { useCallback, useEffect } from "react"
import {
    selectNFTsForCollection,
    selectNftNetworkingSideEffects,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { usePagination } from "../../usePagination"
import { useNFTs } from "~Hooks"

export const useNFTWithMetadata = (collectionAddress: string) => {
    const nftForCollection = useAppSelector(state =>
        selectNFTsForCollection(state, collectionAddress),
    )

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { fetchWithPagination } = usePagination()

    const { getNFTsFotCollection } = useNFTs()

    const nftNetworkingSideEffects = useAppSelector(
        selectNftNetworkingSideEffects,
    )

    const fetchMoreNFTs = useCallback(async () => {
        fetchWithPagination(
            nftForCollection?.pagination.totalElements,
            nftForCollection?.NFTs?.length,
            nftNetworkingSideEffects.isLoading,
            page => {
                getNFTsFotCollection(collectionAddress, page, 10)
            },
        )
    }, [
        collectionAddress,
        fetchWithPagination,
        getNFTsFotCollection,
        nftForCollection?.NFTs?.length,
        nftForCollection?.pagination.totalElements,
        nftNetworkingSideEffects.isLoading,
    ])

    useEffect(() => {
        getNFTsFotCollection(collectionAddress, 0, 10)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccount])

    return {
        NFTs: nftForCollection?.NFTs,
        fetchMoreNFTs,
        isLoading: nftNetworkingSideEffects.isLoading,
        error: nftNetworkingSideEffects.error,
    }
}

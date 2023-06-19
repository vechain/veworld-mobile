import { useCallback, useEffect } from "react"
import {
    selectNFTsForCollection,
    selectNftNetworkingSideEffects,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { usePagination } from "../../usePagination"
import { useNFTs } from "~Hooks"

const COLLECTIONS_PAGE_SIZE = 10

export const useNFTWithMetadata = (collectionAddress: string) => {
    const nftForCollection = useAppSelector(state =>
        selectNFTsForCollection(state, collectionAddress),
    )

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { fetchWithPagination } = usePagination()

    const { getNFTsForCollection } = useNFTs()

    const nftNetworkingSideEffects = useAppSelector(
        selectNftNetworkingSideEffects,
    )

    const fetchMoreNFTs = useCallback(async () => {
        fetchWithPagination(
            nftForCollection?.pagination.totalElements,
            nftForCollection?.NFTs?.length,
            nftNetworkingSideEffects.isLoading,
            page => {
                getNFTsForCollection(
                    collectionAddress,
                    page,
                    COLLECTIONS_PAGE_SIZE,
                )
            },
        )
    }, [
        collectionAddress,
        fetchWithPagination,
        getNFTsForCollection,
        nftForCollection?.NFTs?.length,
        nftForCollection?.pagination.totalElements,
        nftNetworkingSideEffects.isLoading,
    ])

    useEffect(() => {
        getNFTsForCollection(collectionAddress, 0, COLLECTIONS_PAGE_SIZE)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccount])

    return {
        NFTs: nftForCollection?.NFTs,
        fetchMoreNFTs,
        isLoading: nftNetworkingSideEffects.isLoading,
        error: nftNetworkingSideEffects.error,
    }
}

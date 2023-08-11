import { useCallback, useEffect, useMemo } from "react"
import {
    selectNFTsForCollection,
    selectNftNetworkingSideEffects,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { usePagination } from "../../usePagination"
import { useNFTs } from "~Hooks"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"

export const useNFTWithMetadata = (
    collectionAddress: string,
    onEndReachedCalledDuringMomentum: boolean,
    setEndReachedCalledDuringMomentum: React.Dispatch<
        React.SetStateAction<boolean>
    >,
) => {
    const nftForCollection = useAppSelector(state =>
        selectNFTsForCollection(state, collectionAddress),
    )

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { fetchWithPagination } = usePagination()

    const { loadNFTsForCollection } = useNFTs()

    const nftNetworkingSideEffects = useAppSelector(
        selectNftNetworkingSideEffects,
    )

    const hasNext = useMemo(
        () => nftForCollection?.pagination.hasNext ?? false,
        [nftForCollection?.pagination.hasNext],
    )

    const fetchMoreNFTs = useCallback(async () => {
        if (
            onEndReachedCalledDuringMomentum &&
            !nftNetworkingSideEffects.isLoading
        ) {
            await fetchWithPagination(
                nftForCollection?.pagination,
                nftForCollection?.nfts?.length,
                NFT_PAGE_SIZE,
                async page => {
                    await loadNFTsForCollection(collectionAddress, page)
                },
            )

            setEndReachedCalledDuringMomentum(false)
        }
    }, [
        collectionAddress,
        fetchWithPagination,
        loadNFTsForCollection,
        nftForCollection?.nfts?.length,
        nftForCollection?.pagination,
        nftNetworkingSideEffects.isLoading,
        onEndReachedCalledDuringMomentum,
        setEndReachedCalledDuringMomentum,
    ])

    useEffect(() => {
        const init = async () => {
            await loadNFTsForCollection(collectionAddress, 0)
        }

        init()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccount])

    return {
        nfts: nftForCollection?.nfts,
        fetchMoreNFTs,
        isLoading: nftNetworkingSideEffects.isLoading,
        error: nftNetworkingSideEffects.error,
        hasNext,
    }
}

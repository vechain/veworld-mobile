import { useCallback, useEffect, useMemo } from "react"
import { useNFTCollections } from "~Hooks"
import {
    selectAllNFTCollections,
    selectCollectionRegistryInfo,
    selectNftCollections,
    selectNftNetworkingSideEffects,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { isEmpty } from "lodash"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { usePagination } from "../usePagination"

export const useFetchCollections = (
    onEndReachedCalledDuringMomentum: boolean,
    setEndReachedCalledDuringMomentum: React.Dispatch<
        React.SetStateAction<boolean>
    >,
) => {
    const { loadCollections } = useNFTCollections()
    const { fetchWithPagination } = usePagination()
    const network = useAppSelector(selectSelectedNetwork)
    const registryInfo = useAppSelector(selectCollectionRegistryInfo)
    const allNFTCollections = useAppSelector(selectAllNFTCollections)
    const nftCollections = useAppSelector(selectNftCollections)

    const nftNetworkingSideEffects = useAppSelector(
        selectNftNetworkingSideEffects,
    )

    const hasNext = useMemo(
        () =>
            (allNFTCollections?.collections.length ?? 0) <
            allNFTCollections?.pagination.totalElements,

        [
            allNFTCollections?.collections.length,
            allNFTCollections?.pagination.totalElements,
        ],
    )

    useEffect(() => {
        if (isEmpty(allNFTCollections) && registryInfo !== undefined) {
            loadCollections(registryInfo, 0)
        }
    }, [network, registryInfo, loadCollections, allNFTCollections])

    const fetchMoreCollections = useCallback(async () => {
        if (
            onEndReachedCalledDuringMomentum &&
            !nftNetworkingSideEffects?.isLoading
        ) {
            fetchWithPagination(
                allNFTCollections?.pagination,
                allNFTCollections?.collections.length ?? 0,
                NFT_PAGE_SIZE,
                async page => {
                    await loadCollections(registryInfo, page)
                },
            )

            setEndReachedCalledDuringMomentum(false)
        }
    }, [
        allNFTCollections,
        fetchWithPagination,
        loadCollections,
        nftNetworkingSideEffects?.isLoading,
        onEndReachedCalledDuringMomentum,
        registryInfo,
        setEndReachedCalledDuringMomentum,
    ])

    return {
        network,
        registryInfo,
        fetchMoreCollections,
        hasNext,
        isLoading: nftNetworkingSideEffects.isLoading,
        error: nftNetworkingSideEffects.error,
        collections: nftCollections?.collections ?? [],
    }
}

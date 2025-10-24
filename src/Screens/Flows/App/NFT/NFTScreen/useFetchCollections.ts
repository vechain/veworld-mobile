import { isEmpty } from "lodash"
import { useCallback, useEffect, useMemo } from "react"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { useNFTCollections } from "~Hooks"
import { useNFTRegistry } from "~Hooks/useNft/useNFTRegistry"
import {
    selectAllNFTCollections,
    selectNftCollections,
    selectNftNetworkingSideEffects,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { usePagination } from "../usePagination"

export const useFetchCollections = (
    onEndReachedCalledDuringMomentum: boolean,
    setEndReachedCalledDuringMomentum: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    const { loadCollections } = useNFTCollections()
    const { fetchWithPagination } = usePagination()
    const network = useAppSelector(selectSelectedNetwork)
    const { data: registryInfo, isLoading: isRegistryInfoLoading } = useNFTRegistry()
    const allNFTCollections = useAppSelector(selectAllNFTCollections)
    const nftCollections = useAppSelector(selectNftCollections)

    const nftNetworkingSideEffects = useAppSelector(selectNftNetworkingSideEffects)

    const hasNext = useMemo(() => allNFTCollections?.pagination.hasNext, [allNFTCollections?.pagination.hasNext])

    useEffect(() => {
        if (isEmpty(allNFTCollections) && registryInfo !== undefined) {
            loadCollections(registryInfo, 0)
        }
    }, [network.type, registryInfo, loadCollections, allNFTCollections])

    const fetchMoreCollections = useCallback(async () => {
        if (
            onEndReachedCalledDuringMomentum &&
            !nftNetworkingSideEffects?.isLoading &&
            !isRegistryInfoLoading &&
            !!registryInfo
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
        allNFTCollections?.collections.length,
        allNFTCollections?.pagination,
        fetchWithPagination,
        isRegistryInfoLoading,
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
        isLoading: nftNetworkingSideEffects.isLoading || isRegistryInfoLoading,
        error: nftNetworkingSideEffects.error,
        collections: nftCollections?.collections ?? [],
    }
}

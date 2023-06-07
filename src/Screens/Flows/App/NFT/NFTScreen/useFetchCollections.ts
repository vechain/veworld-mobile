import { useCallback, useEffect, useState } from "react"
import { useNFTCollections } from "~Common"
import { usePagination } from "../usePagination"
import {
    selectNftCollections,
    selectNftNetworkingSideEffects,
    useAppSelector,
} from "~Storage/Redux"

export const useFetchCollections = () => {
    const { getCollections } = useNFTCollections()

    const { fetchWithPagination } = usePagination()

    const nftCollections = useAppSelector(selectNftCollections)
    const nftNetworkingSideEffects = useAppSelector(
        selectNftNetworkingSideEffects,
    )

    const [collections, setCollections] = useState(
        nftCollections?.collections ?? [],
    )

    useEffect(() => {
        setCollections(nftCollections?.collections ?? [])
    }, [nftCollections?.collections])

    useEffect(() => {
        getCollections(0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchMoreCollections = useCallback(() => {
        fetchWithPagination(
            nftCollections?.pagination.totalElements,
            nftCollections?.collections?.length,
            nftNetworkingSideEffects.isLoading,
            page => {
                getCollections(page)
            },
        )
    }, [
        fetchWithPagination,
        getCollections,
        nftCollections?.collections?.length,
        nftCollections?.pagination.totalElements,
        nftNetworkingSideEffects.isLoading,
    ])

    return {
        fetchMoreCollections,
        isLoading: nftNetworkingSideEffects.isLoading,
        collections,
    }
}

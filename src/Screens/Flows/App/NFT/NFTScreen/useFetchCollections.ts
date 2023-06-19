import { useCallback, useEffect, useState } from "react"
import { useNFTCollections } from "~Hooks"
import { usePagination } from "../usePagination"
import {
    selectNftCollections,
    selectNftNetworkingSideEffects,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"

export const useFetchCollections = () => {
    const { getCollections } = useNFTCollections()

    const { fetchWithPagination } = usePagination()

    const selectedAccount = useAppSelector(selectSelectedAccount)

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
    }, [selectedAccount])

    const fetchMoreCollections = useCallback(() => {
        fetchWithPagination(
            nftCollections?.pagination?.totalElements,
            nftCollections?.collections?.length,
            nftNetworkingSideEffects?.isLoading,
            page => {
                getCollections(page)
            },
        )
    }, [
        fetchWithPagination,
        getCollections,
        nftCollections?.collections?.length,
        nftCollections?.pagination?.totalElements,
        nftNetworkingSideEffects?.isLoading,
    ])

    return {
        fetchMoreCollections,
        isLoading: nftNetworkingSideEffects.isLoading,
        error: nftNetworkingSideEffects.error,
        collections,
    }
}

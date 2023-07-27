import { useCallback, useEffect, useState } from "react"
import { useNFTCollections } from "~Hooks"
import { usePagination } from "../usePagination"
import {
    selectBlackListedCollections,
    selectCollectionRegistryInfo,
    selectNftCollections,
    selectNftNetworkingSideEffects,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { isEmpty } from "lodash"

const FIRST_TIME_COLLECTIONS_TO_FETCH = 10

export const useFetchCollections = (
    onEndReachedCalledDuringMomentum: boolean,
    setEndReachedCalledDuringMomentum: React.Dispatch<
        React.SetStateAction<boolean>
    >,
) => {
    const { loadCollections } = useNFTCollections()
    const { fetchWithPagination } = usePagination()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const registryInfo = useAppSelector(selectCollectionRegistryInfo)
    const nftCollections = useAppSelector(selectNftCollections)
    const blackListedCollections = useAppSelector(selectBlackListedCollections)

    const nftNetworkingSideEffects = useAppSelector(
        selectNftNetworkingSideEffects,
    )

    const [collections, setCollections] = useState(
        nftCollections?.collections ?? [],
    )

    useEffect(() => {
        setCollections(nftCollections?.collections ?? [])
    }, [nftCollections?.collections, nftCollections?.collections?.length])

    useEffect(() => {
        if (
            isEmpty(nftCollections?.collections) &&
            registryInfo !== undefined
        ) {
            setCollections([])
            loadCollections(
                selectedAccount.address,
                registryInfo,
                0,
                FIRST_TIME_COLLECTIONS_TO_FETCH,
            )
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedAccount,
        network,
        registryInfo,
        loadCollections,
        nftCollections?.collections?.length,
    ])

    const fetchMoreCollections = useCallback(() => {
        if (onEndReachedCalledDuringMomentum) {
            fetchWithPagination(
                nftCollections?.pagination?.totalElements,
                nftCollections?.collections?.length,
                nftNetworkingSideEffects?.isLoading,
                async page => {
                    await loadCollections(
                        selectedAccount.address,
                        registryInfo,
                        page,
                    )
                },
                blackListedCollections?.length,
            )

            setEndReachedCalledDuringMomentum(false)
        }
    }, [
        blackListedCollections?.length,
        fetchWithPagination,
        loadCollections,
        nftCollections?.collections?.length,
        nftCollections?.pagination?.totalElements,
        nftNetworkingSideEffects?.isLoading,
        onEndReachedCalledDuringMomentum,
        registryInfo,
        selectedAccount.address,
        setEndReachedCalledDuringMomentum,
    ])

    return {
        selectedAccount,
        network,
        registryInfo,
        fetchMoreCollections,
        hasNext:
            nftCollections?.pagination.totalElements !==
            collections.length + blackListedCollections?.length,
        isLoading: nftNetworkingSideEffects.isLoading,
        error: nftNetworkingSideEffects.error,
        collections,
    }
}

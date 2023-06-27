import { useCallback, useEffect, useState } from "react"
import { useNFTCollections } from "~Hooks"
import { usePagination } from "../usePagination"
import {
    selectBlackListedCollections,
    selectNftCollections,
    selectNftNetworkingSideEffects,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { isEmpty } from "lodash"

const FIRST_TIME_COLLECITONS_TO_FETCH = 10

export const useFetchCollections = (
    onEndReachedCalledDuringMomentum: boolean,
    setEndReachedCalledDuringMomentum: React.Dispatch<
        React.SetStateAction<boolean>
    >,
) => {
    const { getCollections } = useNFTCollections()

    const { fetchWithPagination } = usePagination()

    const selectedAccount = useAppSelector(selectSelectedAccount)

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
    }, [nftCollections?.collections])

    useEffect(() => {
        if (isEmpty(nftCollections?.collections)) {
            getCollections(0, FIRST_TIME_COLLECITONS_TO_FETCH)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccount, nftCollections?.collections?.length])

    const fetchMoreCollections = useCallback(() => {
        if (onEndReachedCalledDuringMomentum) {
            fetchWithPagination(
                nftCollections?.pagination?.totalElements,
                nftCollections?.collections?.length,
                nftNetworkingSideEffects?.isLoading,
                async page => {
                    await getCollections(page)
                },
                blackListedCollections?.length,
            )

            setEndReachedCalledDuringMomentum(false)
        }
    }, [
        blackListedCollections?.length,
        fetchWithPagination,
        getCollections,
        nftCollections?.collections?.length,
        nftCollections?.pagination?.totalElements,
        nftNetworkingSideEffects?.isLoading,
        onEndReachedCalledDuringMomentum,
        setEndReachedCalledDuringMomentum,
    ])

    return {
        fetchMoreCollections,
        hasNext:
            nftCollections?.pagination.totalElements !==
            collections.length + blackListedCollections?.length,
        isLoading: nftNetworkingSideEffects.isLoading,
        error: nftNetworkingSideEffects.error,
        collections,
    }
}

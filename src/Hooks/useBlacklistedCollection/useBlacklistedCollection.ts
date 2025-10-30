import { useCallback } from "react"
import {
    isBlacklistedCollection,
    selectSelectedAccount,
    selectSelectedNetwork,
    toggleBlackListCollection,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

/**
 * Hook to handle the blacklisted state of a collection
 * @param address Address of the collection
 * @returns object used to handle blacklisted collection state
 */
export const useBlacklistedCollection = (address: string) => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const isBlacklisted = useAppSelector(state => isBlacklistedCollection(state, address))
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const toggleBlacklist = useCallback(() => {
        dispatch(
            toggleBlackListCollection({
                network: network.type,
                collectionAddress: address,
                accountAddress: selectedAccount.address,
            }),
        )
    }, [dispatch, network.type, address, selectedAccount.address])

    return { toggleBlacklist, isBlacklisted }
}

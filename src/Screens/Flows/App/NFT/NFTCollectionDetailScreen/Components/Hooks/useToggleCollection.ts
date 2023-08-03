import { useCallback } from "react"
import { NonFungibleTokenCollection } from "~Model"
import {
    removeBlackListCollection,
    isBlacklistedCollection,
    selectSelectedAccount,
    selectSelectedNetwork,
    setBlackListCollection,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useToggleCollection = (collection: NonFungibleTokenCollection) => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const isBlacklisted = useAppSelector(state =>
        isBlacklistedCollection(state, collection.address),
    )
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const onToggleCollection = useCallback(() => {
        if (isBlacklisted) {
            dispatch(
                removeBlackListCollection({
                    network: network.type,
                    collection,
                    accountAddress: selectedAccount.address,
                }),
            )
        } else {
            dispatch(
                setBlackListCollection({
                    network: network.type,
                    collection,
                    accountAddress: selectedAccount.address,
                }),
            )
        }
    }, [collection, network, dispatch, isBlacklisted, selectedAccount.address])

    return { onToggleCollection, isBlacklisted }
}

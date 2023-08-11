import { useCallback } from "react"
import { NftCollection } from "~Model"
import {
    toggleBlackListCollection,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
    isBlacklistedCollection,
} from "~Storage/Redux"

export const useToggleCollection = (collection: NftCollection) => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const isBlacklisted = useAppSelector(state =>
        isBlacklistedCollection(state, collection.address),
    )
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const onToggleCollection = useCallback(
        () =>
            dispatch(
                toggleBlackListCollection({
                    network: network.type,
                    collection,
                    accountAddress: selectedAccount.address,
                }),
            ),
        [collection, network, dispatch, selectedAccount.address],
    )

    return { onToggleCollection, isBlacklisted }
}

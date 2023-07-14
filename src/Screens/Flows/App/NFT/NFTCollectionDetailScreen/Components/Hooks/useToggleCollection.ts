import { useCallback, useState } from "react"
import { NonFungibleTokenCollection } from "~Model"
import {
    removeBlackListCollection,
    selectSelectedAccount,
    selectSelectedNetwork,
    setBlackListCollection,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useToggleCollection = (collection: NonFungibleTokenCollection) => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const [isBlacklisted, setIsBlacklisted] = useState(collection.isBlacklisted)

    const onToggleCollection = useCallback(() => {
        setIsBlacklisted(prev => !prev)

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

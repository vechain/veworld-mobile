import { useCallback, useState } from "react"
import { NonFungibleTokenCollection } from "~Model"
import {
    removeBlackListCollection,
    selectSelectedAccount,
    setBlackListCollection,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useToggleCollection = (collection: NonFungibleTokenCollection) => {
    const dispatch = useAppDispatch()

    const selectedAccoount = useAppSelector(selectSelectedAccount)

    const [isBlacklisted, setIsBlacklisted] = useState(collection.isBlacklisted)

    const onToggleCollection = useCallback(() => {
        setIsBlacklisted(prev => !prev)

        if (isBlacklisted) {
            dispatch(
                removeBlackListCollection({
                    collection,
                    accountAddress: selectedAccoount.address,
                }),
            )
        } else {
            dispatch(
                setBlackListCollection({
                    collection,
                    accountAddress: selectedAccoount.address,
                }),
            )
        }
    }, [collection, dispatch, isBlacklisted, selectedAccoount.address])

    return { onToggleCollection, isBlacklisted }
}

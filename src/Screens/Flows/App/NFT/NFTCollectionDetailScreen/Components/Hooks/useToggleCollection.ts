import { useCallback, useState } from "react"
import { NonFungibleTokenCollection } from "~Model"
import {
    removeBlackListCollection,
    setBlackListCollection,
    useAppDispatch,
} from "~Storage/Redux"

export const useToggleCollection = (collection: NonFungibleTokenCollection) => {
    const dispatch = useAppDispatch()

    const [isBlacklisted, setIsBlacklisted] = useState(collection.isBlacklisted)

    const onToggleCollection = useCallback(() => {
        setIsBlacklisted(prev => !prev)

        if (isBlacklisted) {
            dispatch(
                removeBlackListCollection({
                    collection,
                }),
            )
        } else {
            dispatch(setBlackListCollection({ collection }))
        }
    }, [collection, dispatch, isBlacklisted])

    return { onToggleCollection, isBlacklisted }
}

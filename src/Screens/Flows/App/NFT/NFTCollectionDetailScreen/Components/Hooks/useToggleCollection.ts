import { useCallback, useState } from "react"
import { NonFungibleTokenCollection } from "~Model"
import {
    removeBlackListCollection,
    setBlackListCollection,
    useAppDispatch,
} from "~Storage/Redux"

export const useToggleCollection = (collection: NonFungibleTokenCollection) => {
    const dispatch = useAppDispatch()

    const [toggleCollectionUI, setToggleCollectionUI] = useState(
        collection.isBlacklisted,
    )

    const onToggleCollection = useCallback(() => {
        setToggleCollectionUI(prev => !prev)

        if (toggleCollectionUI) {
            dispatch(
                removeBlackListCollection({
                    collection,
                }),
            )
        } else {
            dispatch(setBlackListCollection({ collection }))
        }
    }, [collection, dispatch, toggleCollectionUI])

    return { onToggleCollection, toggleCollectionUI }
}

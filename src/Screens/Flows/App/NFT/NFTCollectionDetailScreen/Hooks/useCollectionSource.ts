import { isEmpty } from "lodash"
import { useMemo } from "react"

import {
    selectBlackListedCollectionByAddress,
    selectCollectionWithContractAddress,
    useAppSelector,
} from "~Storage/Redux"

export const useCollectionSource = (collectionAddress: string) => {
    const collection = useAppSelector(state =>
        selectCollectionWithContractAddress(state, collectionAddress),
    )

    const blacklistedCollection = useAppSelector(state =>
        selectBlackListedCollectionByAddress(state, collectionAddress),
    )

    const anyCollection = useMemo(() => {
        if (isEmpty(collection) && !isEmpty(blacklistedCollection)) {
            return blacklistedCollection
        }

        if (!isEmpty(collection) && isEmpty(blacklistedCollection)) {
            return collection
        }
    }, [blacklistedCollection, collection])

    return { anyCollection }
}

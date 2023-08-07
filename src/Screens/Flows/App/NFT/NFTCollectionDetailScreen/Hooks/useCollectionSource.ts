import { isEmpty } from "lodash"
import { useMemo } from "react"

import {
    selectBlacklistedCollectionByAddress,
    selectCollectionWithContractAddress,
    useAppSelector,
} from "~Storage/Redux"

export const useCollectionSource = (collectionAddress: string) => {
    const collection = useAppSelector(state =>
        selectCollectionWithContractAddress(state, collectionAddress),
    )

    const blacklistedCollection = useAppSelector(state =>
        selectBlacklistedCollectionByAddress(state, collectionAddress),
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

import React, { useCallback, useState } from "react"
import { BaseSpacer } from "~Components"
import {
    ChangeCollectionsListView,
    CollectiblesViewMode,
} from "../../Components/Collectibles/ChangeCollectionsListView"
import { CollectiblesListWithView } from "../../Components/Collectibles/CollectiblesListWithView"

export const CollectiblesTopSection = () => {
    const [viewMode, setViewMode] = useState<CollectiblesViewMode>("GALLERY")

    const handleViewChange = useCallback((view: CollectiblesViewMode) => {
        setViewMode(view)
    }, [])

    return (
        <>
            <ChangeCollectionsListView selectedView={viewMode} onViewChange={handleViewChange} />
            <BaseSpacer height={16} />
            <CollectiblesListWithView viewMode={viewMode} />
        </>
    )
}

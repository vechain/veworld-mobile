import { ViewToken } from "@shopify/flash-list"
import { useCallback, useState } from "react"
import { useScrollableList } from "~Hooks/useScrollableList"

export type ScrollableBottomSheetPropsType = {
    onViewableItemsChanged: (info: {
        viewableItems: ViewToken[]
        changed: ViewToken[]
    }) => void
    viewabilityConfig: {
        itemVisiblePercentThreshold: number
    }
    scrollEnabled: boolean
}

export const useScrollableBottomSheet = ({
    snapPoints,
    data,
}: {
    snapPoints: string[]
    data: any[]
}): {
    handleSheetChangePosition: (index: number) => void
    scrollableBottomSheetProps: ScrollableBottomSheetPropsType
} => {
    const [snapIndex, setSnapIndex] = useState<number>(0)

    const handleSheetChangePosition = useCallback((index: number) => {
        setSnapIndex(index)
    }, [])

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(data, snapIndex, snapPoints.length)

    return {
        handleSheetChangePosition,
        scrollableBottomSheetProps: {
            onViewableItemsChanged,
            viewabilityConfig,
            scrollEnabled: isListScrollable,
        },
    }
}

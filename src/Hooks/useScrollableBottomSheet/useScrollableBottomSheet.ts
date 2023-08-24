import { useCallback, useState } from "react"
import { ViewToken } from "react-native"
import { useScrollableList } from "~Hooks/useScrollableList"

export type ListScrollPropsType = {
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
    listScrollProps: ListScrollPropsType
} => {
    const [snapIndex, setSnapIndex] = useState<number>(0)

    const handleSheetChangePosition = useCallback((index: number) => {
        setSnapIndex(index)
    }, [])

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(data, snapIndex, snapPoints.length)

    return {
        handleSheetChangePosition,
        listScrollProps: {
            onViewableItemsChanged,
            viewabilityConfig,
            scrollEnabled: isListScrollable,
        },
    }
}

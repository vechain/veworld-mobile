import { useCallback, useState } from "react"
import { ViewToken } from "react-native"
import { useScrollableList } from "~Hooks/useScrollableList"

export type FlatListScrollPropsType = {
    onViewableItemsChanged: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void
    viewabilityConfig: {
        itemVisiblePercentThreshold: number
    }
    scrollEnabled: boolean
    showsVerticalScrollIndicator: boolean
    showsHorizontalScrollIndicator: boolean
}

export const useScrollableBottomSheet = ({ snapPoints, data }: { snapPoints: string[]; data: any[] }) => {
    const [snapIndex, setSnapIndex] = useState<number>(0)

    const handleSheetChangePosition = useCallback((index: number) => {
        setSnapIndex(index)
    }, [])

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged, visibleItemsCount } = useScrollableList(
        data,
        snapIndex,
        snapPoints.length,
    )

    return {
        handleSheetChangePosition,
        visibleItemsCount,
        flatListScrollProps: {
            onViewableItemsChanged,
            viewabilityConfig,
            scrollEnabled: isListScrollable,
            showsVerticalScrollIndicator: false,
            showsHorizontalScrollIndicator: false,
        },
    }
}

import { useCallback, useState } from "react"
import { useScrollableList } from "~Hooks/useScrollableList"
import { PlatformUtils } from "~Utils"

export const useScrollableBottomSheet = ({
    snapPoints,
    data,
}: {
    snapPoints: string[]
    data: any[]
}) => {
    const [snapIndex, setSnapIndex] = useState<number>(0)

    const handleSheetChangePosition = useCallback((index: number) => {
        setSnapIndex(index)
    }, [])

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(data, snapIndex, snapPoints.length)

    return {
        handleSheetChangePosition,
        flatListScrollProps: {
            onViewableItemsChanged,
            viewabilityConfig,
            scrollEnabled: isListScrollable,
            showsVerticalScrollIndicator: false,
            showsHorizontalScrollIndicator: false,
            windowSize: PlatformUtils.isIOS() ? 3 : 20,
            maxToRenderPerBatch: PlatformUtils.isIOS() ? 1 : 5,
        },
    }
}

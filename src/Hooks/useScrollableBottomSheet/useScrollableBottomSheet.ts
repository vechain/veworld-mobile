import { useCallback, useState } from "react"
import { useScrollableList } from "~Hooks/useScrollableList"

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
        scrollableBottomSheetProps: {
            onViewableItemsChanged,
            viewabilityConfig,
            scrollEnabled: isListScrollable,
        },
    }
}

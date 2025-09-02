import { MutableRefObject, useCallback, useMemo, useState } from "react"
import { LayoutChangeEvent, ViewStyle } from "react-native"
import { SCREEN_HEIGHT } from "~Constants"

type Args = {
    onResize: (value: boolean) => void
    initialLayout: MutableRefObject<boolean>
}

/**
 * Hook for creating nested scrollable components inside a BottomSheet.
 * Do not use @gorhom/bottom-sheet components, just use these
 */
export const useScrollableBottomSheetList = ({ onResize, initialLayout }: Args) => {
    const [height, setHeight] = useState(SCREEN_HEIGHT)
    const onContentSizeChange = useCallback(
        (_: number, contentHeight: number) => {
            if (contentHeight <= height) {
                onResize(true)
                setHeight(contentHeight)
            } else {
                onResize(false)
            }
        },
        [height, onResize],
    )

    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const _height = e.nativeEvent.layout.height
            if (initialLayout.current) return

            if (_height < SCREEN_HEIGHT) {
                setHeight(_height)
                initialLayout.current = true
            }
        },
        [initialLayout],
    )

    const style = useMemo(() => ({ maxHeight: height, height } as ViewStyle), [height])

    const resetHeight = useCallback(() => setHeight(SCREEN_HEIGHT), [])

    return useMemo(
        () => ({ style, onLayout, onContentSizeChange, resetHeight }),
        [onContentSizeChange, onLayout, style, resetHeight],
    )
}

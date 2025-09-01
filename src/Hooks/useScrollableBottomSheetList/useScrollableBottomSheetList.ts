import { useCallback, useMemo, useRef, useState } from "react"
import { LayoutChangeEvent, ViewStyle } from "react-native"
import { SCREEN_HEIGHT } from "~Constants"

type Args = {
    onResize: (value: boolean) => void
}

/**
 * Hook for creating nested scrollable components inside a BottomSheet.
 * Do not use @gorhom/bottom-sheet components, just use these
 */
export const useScrollableBottomSheetList = ({ onResize }: Args) => {
    const [height, setHeight] = useState(SCREEN_HEIGHT)
    const initialLayout = useRef(false)
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

    const onLayout = useCallback((e: LayoutChangeEvent) => {
        const _height = e.nativeEvent.layout.height
        if (initialLayout.current) return

        if (_height < SCREEN_HEIGHT) {
            setHeight(_height)
            initialLayout.current = true
        }
    }, [])

    const style = useMemo(() => ({ maxHeight: height } as ViewStyle), [height])

    return useMemo(() => ({ style, onLayout, onContentSizeChange }), [onContentSizeChange, onLayout, style])
}

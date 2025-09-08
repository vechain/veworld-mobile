import { MutableRefObject, useCallback, useMemo, useState } from "react"
import { LayoutChangeEvent, useWindowDimensions, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { usePrevious } from "~Hooks/usePrevious"

type Args = {
    onResize: (value: boolean) => void
    initialLayout: MutableRefObject<boolean>
}

/**
 * Hook for creating nested scrollable components inside a BottomSheet.
 * Do not use @gorhom/bottom-sheet components, just use these
 */
export const useScrollableBottomSheetList = ({ onResize, initialLayout }: Args) => {
    const { height: windowHeight } = useWindowDimensions()
    const { bottom: bottomSafeAreaSize } = useSafeAreaInsets()

    const maxHeight = useMemo(
        () => Math.floor((windowHeight - bottomSafeAreaSize) * 0.85),
        [bottomSafeAreaSize, windowHeight],
    )

    const [height, setHeight] = useState(maxHeight)
    const previousHeight = usePrevious(height)
    const [offsetY, setOffsetY] = useState(160)
    const onContentSizeChange = useCallback(
        (_: number, contentHeight: number) => {
            if (contentHeight <= height) {
                const overflows = contentHeight + offsetY >= height
                const minValue = overflows ? maxHeight - offsetY - 100 : contentHeight
                setHeight(minValue)
                //If the height increased, just set it as a small viewport to set the correct size
                if ((previousHeight ?? 0) < contentHeight) onResize(true)
                //Otherwise make the component figure it out itself
                else onResize(!overflows)
            } else {
                onResize(false)
            }
        },
        [height, maxHeight, offsetY, onResize, previousHeight],
    )

    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const _height = e.nativeEvent.layout.height
            setOffsetY(e.nativeEvent.layout.y)
            if (initialLayout.current) return

            if (_height < maxHeight) {
                setHeight(_height)
                initialLayout.current = true
            }
        },
        [initialLayout, maxHeight],
    )

    const style = useMemo(() => ({ maxHeight: height, height } as ViewStyle), [height])

    const resetHeight = useCallback(() => setHeight(maxHeight), [maxHeight])

    return useMemo(
        () => ({ style, onLayout, onContentSizeChange, resetHeight }),
        [onContentSizeChange, onLayout, style, resetHeight],
    )
}

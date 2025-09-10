import { useCallback, useMemo, useState } from "react"
import { useWindowDimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

/**
 * Use in combination with `useScrollableBottomSheetList`.
 * Pass `onResize` to it
 */
export const useScrollableBottomSheetListWrapper = () => {
    const [smallViewport, setSmallViewport] = useState(false)
    const onResize = useCallback((newValue: boolean) => {
        setSmallViewport(newValue)
    }, [])

    const { height: windowHeight } = useWindowDimensions()
    const { bottom: bottomSafeAreaSize } = useSafeAreaInsets()

    const maxHeight = useMemo(
        () => Math.floor((windowHeight - bottomSafeAreaSize) * 0.85),
        [bottomSafeAreaSize, windowHeight],
    )

    const contentStyle = useMemo(() => (smallViewport ? undefined : { height: maxHeight }), [maxHeight, smallViewport])

    return useMemo(() => ({ contentStyle, onResize, setSmallViewport }), [contentStyle, onResize])
}

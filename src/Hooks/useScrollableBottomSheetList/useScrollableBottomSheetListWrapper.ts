import { useCallback, useMemo, useState } from "react"

/**
 * Use in combination with `useScrollableBottomSheetList`.
 * Pass `onResize` to it
 */
export const useScrollableBottomSheetListWrapper = () => {
    const [smallViewport, setSmallViewport] = useState(false)
    const onResize = useCallback((newValue: boolean) => {
        setSmallViewport(newValue)
    }, [])

    const contentStyle = useMemo(() => (smallViewport ? undefined : { height: "100%" as const }), [smallViewport])

    return useMemo(() => ({ contentStyle, onResize }), [contentStyle, onResize])
}

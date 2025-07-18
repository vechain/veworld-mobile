import { ComponentProps, default as React, useCallback, useMemo } from "react"
import { SCREEN_WIDTH } from "~Constants"
import { BaseCarousel } from "./BaseCarousel"

type Props = {
    /**
     * Padding on the left and right.
     * @default 16
     */
    padding?: number
    /**
     * Base width.
     * @default SCREEN_WIDTH
     */
    baseWidth?: number
} & Pick<
    ComponentProps<typeof BaseCarousel>,
    | "data"
    | "paginationAlignment"
    | "showPagination"
    | "onSlidePress"
    | "onSlidePressActivation"
    | "contentWrapperStyle"
    | "testID"
    | "itemHeight"
    | "gap"
>

export const FullscreenBaseCarousel = ({ padding = 16, data, baseWidth = SCREEN_WIDTH, gap = 8, ...props }: Props) => {
    const itemWidth = useMemo(() => baseWidth - padding * 3 - gap, [baseWidth, padding, gap])
    const snapOffsets = useMemo(
        () =>
            data.map((_, idx, arr) => {
                if (idx === 0) return 0
                if (idx === arr.length - 1)
                    return baseWidth - 3 * gap * (data.length - 2) + baseWidth * (data.length - 2)
                return baseWidth * idx - 3 * gap * idx
            }),
        [baseWidth, data, gap],
    )
    const calculateWidth = useCallback(
        (idx: number) => {
            if (idx === 0 || idx === data.length - 1) return baseWidth - 2 * gap
            return baseWidth - 4 * gap
        },
        [baseWidth, data.length, gap],
    )
    const mappedData = useMemo(
        () =>
            data.map((d, idx) => ({
                ...d,
                style: [d.style, { width: calculateWidth(idx) }],
            })),
        [calculateWidth, data],
    )
    return (
        <BaseCarousel
            w={itemWidth}
            snapOffsets={snapOffsets}
            data={mappedData}
            padding={padding}
            gap={gap}
            {...props}
        />
    )
}

import { ComponentProps, default as React, useMemo } from "react"
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
>

export const FullscreenBaseCarousel = ({
    contentWrapperStyle,
    padding = 16,
    data,
    baseWidth = SCREEN_WIDTH,
    ...props
}: Props) => {
    const itemWidth = useMemo(() => baseWidth - padding * 2, [baseWidth, padding])
    const snapOffsets = useMemo(() => data.map((_, idx) => baseWidth * idx), [baseWidth, data])
    return (
        <BaseCarousel
            contentWrapperStyle={[contentWrapperStyle, { width: baseWidth }, { paddingHorizontal: padding }]}
            w={itemWidth}
            snapOffsets={snapOffsets}
            data={data}
            padding={0}
            gap={0}
            {...props}
        />
    )
}

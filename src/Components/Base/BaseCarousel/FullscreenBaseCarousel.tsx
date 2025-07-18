import { ComponentProps, default as React, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
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

export const FullscreenBaseCarousel = ({
    padding = 16,
    data,
    baseWidth = SCREEN_WIDTH,
    gap = 8,
    contentWrapperStyle,
    ...props
}: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    /**
     * Calculate the snap offsets
     */
    const snapOffsets = useMemo(
        () =>
            data.map((_, idx, arr) => {
                //If it's the first item, return 0
                if (idx === 0) return 0
                // if (idx === arr.length - 1)
                //     return baseWidth - 3 * gap * (data.length - 2) + baseWidth * (data.length - 2)
                if (idx === arr.length - 1) {
                    //Calculate the length of N-1 tabs
                    const tabsNormalLength = baseWidth * (data.length - 1)
                    //Gap of all the middle tabs (based on the calculation below)
                    const middleTabsLength = 3 * gap * (data.length - 2)
                    return tabsNormalLength - middleTabsLength
                }
                return (baseWidth - 3 * gap) * idx
            }),
        [baseWidth, data, gap],
    )
    /**
     * Calculate the width of each card.
     * Each card will show a {@link gap} of the next card.
     * The first and last card will only need to show one card to the right/left, so it's 2*gap.
     * The cards in the middle need to show a card on the left and right, that's why it's double the gap
     */
    const calculateWidth = useCallback(
        (idx: number) => {
            if (idx === 0 || idx === data.length - 1) return baseWidth - 2 * gap
            return baseWidth - 4 * gap
        },
        [baseWidth, data.length, gap],
    )
    /**
     * Add the style property to each card in order to set the specific width they need
     */
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
            snapOffsets={snapOffsets}
            data={mappedData}
            padding={padding}
            gap={gap}
            contentWrapperStyle={[contentWrapperStyle, styles.itemWrapper]}
            {...props}
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        itemWrapper: {
            paddingHorizontal: 0,
        },
    })

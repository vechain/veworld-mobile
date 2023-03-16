import React, { useCallback, useEffect, useMemo, useRef } from "react"
import {
    ScrollView,
    View,
    ViewStyle,
    StyleProp,
    StyleSheet,
} from "react-native"
import Dot from "./Dot"
import EmptyDot, { defaultEmptyDotSize } from "./EmptyDot"
import { usePrevious } from "~Common"
import { BaseView } from "~Components"

type Props = {
    curPage: number
    maxPage: number
    sizeRatio?: number
    activeDotColor: string
    inactiveDotColor?: string
}

const ONE_EMPTY_DOT_SIZE = defaultEmptyDotSize * defaultEmptyDotSize

export const PaginatedDot: React.FC<Props> = (props: Props) => {
    const { curPage, maxPage, activeDotColor, inactiveDotColor } = props

    const refScrollView = useRef<ScrollView>(null)
    const prevPage = usePrevious(curPage)

    //Size of the dots are calculated based on the sizeRatio
    const getSizeRatio = useCallback<() => number>(() => {
        if (!props.sizeRatio) return 1.0

        return Math.max(1.0, props.sizeRatio)
    }, [props.sizeRatio])

    //Scrolls to the given index with animation
    const scrollTo = useCallback<(index: number, animated?: boolean) => void>(
        (index, animated = true) => {
            //check if ref is available
            if (!refScrollView.current) return

            const sizeRatio = getSizeRatio()
            const FIRST_EMPTY_DOT_SPACE = ONE_EMPTY_DOT_SIZE * 2
            const MOVE_DISTANCE = ONE_EMPTY_DOT_SIZE * sizeRatio

            const moveTo = Math.max(
                0,
                FIRST_EMPTY_DOT_SPACE + (index - 4) * MOVE_DISTANCE,
            )

            //scroll to the given coordinates
            refScrollView.current.scrollTo({
                x: moveTo,
                y: 0,
                animated,
            })
        },
        [getSizeRatio],
    )

    const getContainerStyle = useCallback<() => StyleProp<ViewStyle>>(() => {
        const sizeRatio = getSizeRatio()
        const containerSize = 95 * sizeRatio

        return {
            alignItems: "center",
            flexDirection: "row",
            maxHeight: 15,
            maxWidth: containerSize,
        }
    }, [getSizeRatio])

    useEffect(() => {
        if (maxPage > 4 && prevPage !== curPage) scrollTo(curPage)
    }, [prevPage, curPage, maxPage, scrollTo])

    const list = useMemo(() => [...Array(maxPage).keys()], [maxPage])

    //Normalization of the current page to be between [0, maxPage - 1]
    let normalizedPage = curPage
    if (curPage < 0) {
        normalizedPage = 0
    }

    if (curPage > maxPage - 1) {
        normalizedPage = maxPage - 1
    }

    const sizeRatio = getSizeRatio()

    const container = getContainerStyle()

    if (maxPage < 5) {
        return (
            <View style={container}>
                {list.map(i => {
                    return (
                        <Dot
                            key={i}
                            idx={i}
                            sizeRatio={sizeRatio}
                            curPage={normalizedPage}
                            maxPage={maxPage}
                            activeColor={activeDotColor}
                            inactiveDotColor={inactiveDotColor}
                        />
                    )
                })}
            </View>
        )
    }

    return (
        <BaseView
            style={container}
            onLayout={() => {
                // scroll to correct index on initial render
                scrollTo(curPage, false)
            }}>
            <ScrollView
                ref={refScrollView}
                contentContainerStyle={styles.scrollViewContainer}
                bounces={false}
                horizontal
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}>
                {/* previous empty dummy dot */}
                <EmptyDot sizeRatio={sizeRatio} />
                <EmptyDot sizeRatio={sizeRatio} />

                {list.map(i => {
                    return (
                        <Dot
                            sizeRatio={sizeRatio}
                            key={i}
                            idx={i}
                            curPage={normalizedPage}
                            maxPage={maxPage}
                            activeColor={activeDotColor}
                            inactiveDotColor={inactiveDotColor}
                        />
                    )
                })}

                {/* following empty dummy dot */}
                <EmptyDot sizeRatio={sizeRatio} />
                <EmptyDot sizeRatio={sizeRatio} />
            </ScrollView>
        </BaseView>
    )
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        alignItems: "center",
    },
})

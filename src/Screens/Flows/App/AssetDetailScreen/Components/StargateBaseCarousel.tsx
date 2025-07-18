import React, { useCallback, useMemo, useRef, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSpacer, BaseView, CarouselSlideItem } from "~Components"
import { BaseCarouselItem } from "~Components/Base/BaseCarousel/BaseCarouselItem"
import { ColorThemeType, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    data: CarouselSlideItem[]
    /**
     * This should be the desired width of the carousel item.
     */
    w?: number
    /**
     * This should be the desired height of the carousel item
     */
    h?: number
    autoPlay?: boolean
    autoPlayInterval?: number
    loop?: boolean
    showPagination?: boolean
    paginationAlignment?: "flex-start" | "center" | "flex-end"
    testID?: string
    onSlidePress?: (name: string) => void
    /**
     * Decide when `onSlidePress` is called. Default is `after
     */
    onSlidePressActivation?: "before" | "after"
    containerStyle?: ViewStyle
    carouselStyle?: ViewStyle
    contentWrapperStyle?: ViewStyle
    /**
     * Pagination style. Only applicable if `showPagination` is set to true.
     */
    paginationStyle?: ViewStyle
    /**
     * Style for the root container
     */
    rootStyle?: ViewStyle
    /**
     * Gap between items
     */
    gap?: number
    /**
     * Padding around the carousel.
     * Do not use a custom style to set it since it'll break the normal layout
     */
    padding?: number
}

export const StargateBaseCarousel = ({
    data,
    onSlidePress,
    contentWrapperStyle,
    onSlidePressActivation,
    gap = 8,
    w = SCREEN_WIDTH,
    showPagination = true,
    rootStyle,
    paginationAlignment = "center",
    paginationStyle,
    containerStyle,
    padding = 16,
}: Props) => {
    const [page, setPage] = useState(0)

    const ref = useRef<Animated.FlatList<any>>(null)
    const { styles } = useThemedStyles(baseStyles(paginationAlignment))

    const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        let contentOffset = e.nativeEvent.contentOffset
        let viewSize = e.nativeEvent.layoutMeasurement

        if (contentOffset.x === 0) setPage(0)
        else setPage(Math.floor((contentOffset.x + viewSize.width) / viewSize.width))
    }, [])

    const ItemSeparatorComponent = useCallback(() => <BaseSpacer width={gap} />, [gap])

    const onPressPagination = useCallback((index: number) => {
        ref.current?.scrollToIndex({
            index,
            animated: true,
        })
        setPage(index)
    }, [])

    const offsets = useMemo(
        () =>
            Array.from({ length: data.length }, (_, idx) => {
                if (idx === 0 || idx === data.length - 1) return w + gap + padding
                return w + gap
            }),
        [data.length, gap, padding, w],
    )

    return (
        <BaseView flex={1} flexDirection="column" style={[styles.root, rootStyle]}>
            <Animated.FlatList
                ref={ref}
                data={data}
                snapToOffsets={offsets}
                ItemSeparatorComponent={ItemSeparatorComponent}
                pagingEnabled
                decelerationRate="fast"
                snapToAlignment="start"
                horizontal
                onMomentumScrollEnd={onMomentumScrollEnd}
                style={containerStyle}
                keyExtractor={item => item.name ?? ""}
                renderItem={({ item, index }) => {
                    return (
                        <BaseCarouselItem
                            testID={item.testID}
                            href={item.href}
                            isExternalLink={item.isExternalLink}
                            name={item.name}
                            onPress={onSlidePress}
                            contentWrapperStyle={[
                                contentWrapperStyle,
                                index === 0
                                    ? { paddingStart: padding }
                                    : index === data.length - 1
                                    ? { paddingEnd: padding }
                                    : undefined,
                            ]}
                            onPressActivation={onSlidePressActivation}
                            closable={item.closable}
                            onClose={item.onClose}
                            closeButtonStyle={item.closeButtonStyle}
                            style={item.style}>
                            {item.content}
                        </BaseCarouselItem>
                    )
                }}
                showsHorizontalScrollIndicator={false}
            />
            {showPagination && (
                <BaseView style={[styles.dotContainer, { paddingStart: padding }, paginationStyle]}>
                    {Array.from({ length: data.length }, (_, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.dot, page === idx ? styles.activeDot : undefined]}
                            onPress={onPressPagination.bind(null, idx)}
                        />
                    ))}
                </BaseView>
            )}
        </BaseView>
    )
}

const baseStyles = (paginationAlignment: "flex-start" | "center" | "flex-end") => (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            gap: 12,
        },
        dotContainer: {
            gap: 6,
            alignSelf: paginationAlignment,
            paddingHorizontal: 16,
            flexDirection: "row",
        },
        dot: {
            backgroundColor: theme.colors.defaultCarousel.dotBg,
            borderRadius: 50,
            width: 8,
            height: 8,
        },
        activeDot: {
            backgroundColor: theme.colors.defaultCarousel.activeDotBg,
            borderRadius: 50,
        },
    })

import React, { useCallback, useMemo, useRef, useState } from "react"
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from "react-native"
import Animated from "react-native-reanimated"
import { BaseCarouselItem } from "~Components/Base/BaseCarousel/BaseCarouselItem"
import { BaseSpacer } from "~Components/Base/BaseSpacer"
import { BaseView } from "~Components/Base/BaseView"
import { ColorThemeType, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"

export type CarouselSlideItem = {
    name?: string
    testID?: string
    href?: string
    content: React.ReactNode
    isExternalLink?: boolean
    closable?: boolean
    onClose?: () => void
    closeButtonStyle?: ViewStyle
    style?: StyleProp<ViewStyle>
}

type Props = {
    data: CarouselSlideItem[]
    /**
     * Width used to calculate snap offsets.
     */
    w?: number
    /**
     * Height of the item
     */
    itemHeight?: number
    showPagination?: boolean
    paginationAlignment?: "flex-start" | "center" | "flex-end"
    testID?: string
    onSlidePress?: (name: string) => void
    /**
     * Decide when `onSlidePress` is called. Default is `after
     */
    onSlidePressActivation?: "before" | "after"
    /**
     * Style of the carousel
     */
    containerStyle?: StyleProp<ViewStyle>
    /**
     * Style of the {@link BaseCarouselItem}
     */
    contentWrapperStyle?: StyleProp<ViewStyle>
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
    /**
     * Provide snap offsets. By default they're calculated
     */
    snapOffsets?: number[]
}

export const BaseCarousel = ({
    data,
    onSlidePress,
    contentWrapperStyle,
    onSlidePressActivation,
    gap = 8,
    w: _w = SCREEN_WIDTH,
    showPagination = true,
    rootStyle,
    paginationAlignment = "center",
    paginationStyle,
    containerStyle,
    padding = 16,
    testID,
    snapOffsets,
    itemHeight,
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

    const w = useMemo(() => {
        if (_w + gap >= SCREEN_WIDTH) return SCREEN_WIDTH - gap
        return _w
    }, [_w, gap])

    const offsets = useMemo(
        () =>
            Array.from({ length: data.length }, (_, idx) => {
                if (idx === 0) return 0
                return w * idx + gap * idx + padding
            }),
        [data.length, gap, padding, w],
    )

    const getInitialPaddingStyles = useCallback(
        (index: number) => {
            if (padding === 0) return undefined
            if (index === 0) return { paddingStart: padding }
            if (index === data.length - 1) return { paddingEnd: padding }
        },
        [data.length, padding],
    )

    return (
        <BaseView flex={1} flexDirection="column" style={[styles.root, rootStyle]}>
            <Animated.FlatList
                ref={ref}
                data={data}
                snapToOffsets={snapOffsets ?? offsets}
                snapToEnd={false}
                snapToStart={false}
                disableIntervalMomentum
                ItemSeparatorComponent={ItemSeparatorComponent}
                pagingEnabled
                decelerationRate="normal"
                snapToAlignment="start"
                horizontal
                onMomentumScrollEnd={onMomentumScrollEnd}
                style={containerStyle}
                keyExtractor={item => item.name ?? ""}
                testID={testID}
                renderItem={({ item, index }) => {
                    return (
                        <BaseCarouselItem
                            testID={item.testID}
                            href={item.href}
                            isExternalLink={item.isExternalLink}
                            name={item.name}
                            onPress={onSlidePress}
                            contentWrapperStyle={[
                                itemHeight ? { height: itemHeight } : undefined,
                                contentWrapperStyle,
                                getInitialPaddingStyles(index),
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

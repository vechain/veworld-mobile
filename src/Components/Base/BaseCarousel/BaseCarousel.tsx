import React, { useMemo } from "react"
import { StyleSheet, ViewStyle } from "react-native"
import { useSharedValue } from "react-native-reanimated"
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel"
import { DotStyle } from "react-native-reanimated-carousel/lib/typescript/components/Pagination/Custom/PaginationItem"
import { ColorThemeType, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseView } from "../BaseView"
import { BaseCarouselItem } from "./BaseCarouselItem"

export type CarouselSlideItem = {
    name?: string
    testID?: string
    href?: string
    content: React.ReactNode
    isExternalLink?: boolean
    closable?: boolean
    onClose?: () => void
    closeButtonStyle?: ViewStyle
    style?: ViewStyle
}

type ParallaxProps = {
    /**
     * Mode of the Carousel: choose 'parallax' for a parallax effect, 'horizontal' for a normal carousel.
     * @default 'parallax'
     */
    mode?: "parallax"

    /**
     * Scrolling offset for the parallax effect. Only works when `mode` is set to `parallax`.
     * @default SCREEN_WIDTH / 5
     */
    parallaxScrollingOffset?: number
}

type HorizontalProps = {
    /**
     * Mode of the Carousel: choose 'parallax' for a parallax effect, 'normal' for a normal carousel.
     * @default 'parallax'
     */
    mode?: "normal"
    /**
     * Width of the whole container.
     * @default SCREEN_WIDTH
     */
    containerWidth?: number
    /**
     * Gap between elements.
     * @default 0
     */
    gap?: number
}

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
} & (ParallaxProps | HorizontalProps)

export const BaseCarousel = ({
    data,
    w = SCREEN_WIDTH,
    h = 108,
    autoPlay = true,
    autoPlayInterval = 10000,
    loop = true,
    paginationAlignment = "center",
    showPagination = true,
    testID,
    onSlidePress,
    onSlidePressActivation,
    containerStyle,
    carouselStyle,
    contentWrapperStyle,
    paginationStyle,
    rootStyle,
    ...restProps
}: Props) => {
    const ref = React.useRef<ICarouselInstance>(null)
    const progress = useSharedValue<number>(0)
    const { styles } = useThemedStyles(baseStyles(paginationAlignment))

    const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
            /**
             * Calculate the difference between the current index and the target index
             * to ensure that the carousel scrolls to the nearest index
             */
            count: index - progress.value,
            animated: true,
        })
    }

    const mode = useMemo(() => restProps.mode ?? "parallax", [restProps.mode])

    const configFromMode = useMemo(() => {
        if (mode === "normal") return {}
        return {
            mode: "parallax" as const,
            modeConfig: {
                parallaxScrollingScale: 1,
                parallaxAdjacentItemScale: 0.8,
                parallaxScrollingOffset: (restProps as ParallaxProps).parallaxScrollingOffset ?? SCREEN_WIDTH / 6.5,
            },
        }
    }, [mode, restProps])

    const carouselStyles = useMemo(() => {
        if (mode === "parallax") return [styles.carousel, carouselStyle]
        return [styles.carousel, { width: (restProps as HorizontalProps).containerWidth }, carouselStyle]
    }, [carouselStyle, mode, restProps, styles.carousel])

    const containerStyles = useMemo(() => {
        if (mode === "parallax") return [styles.carouselContainer, containerStyle]
        return [styles.carouselContainer, { width: (restProps as HorizontalProps).containerWidth }, containerStyle]
    }, [containerStyle, mode, restProps, styles.carouselContainer])

    const itemWidth = useMemo(() => {
        if (mode === "parallax") return w
        const gap = (restProps as HorizontalProps).gap ?? 0
        if (w + gap >= SCREEN_WIDTH) return SCREEN_WIDTH
        return w + gap
    }, [mode, restProps, w])

    return (
        <BaseView flex={1} style={[styles.container, rootStyle]} testID={testID}>
            <Carousel
                ref={ref}
                data={data}
                autoPlay={autoPlay}
                loop={loop}
                width={itemWidth}
                height={h}
                style={carouselStyles}
                pagingEnabled
                snapEnabled
                containerStyle={containerStyles}
                {...configFromMode}
                autoPlayInterval={autoPlayInterval}
                onProgressChange={progress}
                renderItem={({ item }) => {
                    return (
                        <BaseCarouselItem
                            testID={item.testID}
                            href={item.href}
                            isExternalLink={item.isExternalLink}
                            name={item.name}
                            onPress={onSlidePress}
                            contentWrapperStyle={contentWrapperStyle}
                            onPressActivation={onSlidePressActivation}
                            closable={item.closable}
                            onClose={item.onClose}
                            closeButtonStyle={item.closeButtonStyle}
                            style={item.style}>
                            {item.content}
                        </BaseCarouselItem>
                    )
                }}
            />

            {showPagination && (
                <Pagination.Basic
                    progress={progress}
                    data={data as object[]}
                    containerStyle={[styles.paginatioContainer, paginationStyle]}
                    size={8}
                    onPress={onPressPagination}
                    dotStyle={styles.dots as DotStyle}
                    activeDotStyle={styles.activeDot as DotStyle}
                />
            )}
        </BaseView>
    )
}

const baseStyles = (paginationAlignment: "flex-start" | "center" | "flex-end") => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            gap: 12,
        },
        carouselContainer: {
            width: "100%",
        },
        carousel: {
            width: SCREEN_WIDTH,
        },
        paginatioContainer: {
            gap: 6,
            alignSelf: paginationAlignment,
            paddingHorizontal: 16,
        },
        dots: {
            backgroundColor: theme.colors.defaultCarousel.dotBg,
            borderRadius: 50,
        },
        activeDot: {
            backgroundColor: theme.colors.defaultCarousel.activeDotBg,
            borderRadius: 50,
        },
    })

import React from "react"
import { BaseView } from "../BaseView"
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel"
import { useSharedValue } from "react-native-reanimated"
import { ColorThemeType, SCREEN_WIDTH } from "~Constants"
import { ImageSourcePropType, StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { DotStyle } from "react-native-reanimated-carousel/lib/typescript/components/Pagination/Custom/PaginationItem"
import { BaseCarouselItem } from "./BaseCarouselItem"

export type CarouselSlideItem = {
    title?: string
    testID?: string
    href?: string
    source: ImageSourcePropType
    isExternalLink?: boolean
    w?: number
    h?: number
}

type Props = {
    data: CarouselSlideItem[]
    w?: number
    h?: number
    autoPlay?: boolean
    autoPlayInterval?: number
    loop?: boolean
    paginationAlignment?: "flex-start" | "center" | "flex-end"
}

export const BaseCarousel = ({
    data,
    w = 360,
    h = 100,
    autoPlay = true,
    autoPlayInterval = 10000,
    loop = true,
    paginationAlignment = "center",
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

    return (
        <BaseView flex={1} style={[styles.container]}>
            <Carousel
                ref={ref}
                data={data}
                autoPlay={autoPlay}
                loop={loop}
                width={w}
                height={h}
                style={styles.carousel}
                pagingEnabled
                containerStyle={styles.carouselContainer}
                snapEnabled={true}
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 1,
                    parallaxScrollingOffset: -10,
                }}
                autoPlayInterval={autoPlayInterval}
                onProgressChange={progress}
                renderItem={({ item }) => {
                    return (
                        <BaseCarouselItem
                            testID={item.testID}
                            source={item.source}
                            href={item.href}
                            isExternalLink={item.isExternalLink}
                            w={item.w}
                            h={item.h}
                        />
                    )
                }}
            />

            <Pagination.Basic
                progress={progress}
                data={data as object[]}
                containerStyle={styles.paginatioContainer}
                size={8}
                onPress={onPressPagination}
                dotStyle={styles.dots as DotStyle}
                activeDotStyle={styles.activeDot as DotStyle}
            />
        </BaseView>
    )
}

const baseStyles = (paginationAlignment: "flex-start" | "center" | "flex-end") => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            gap: 8,
        },
        carouselContainer: {
            //paddingHorizontal: 20,
            width: "100%",
        },
        carousel: {
            width: SCREEN_WIDTH,
        },
        paginatioContainer: {
            gap: 6,
            alignSelf: paginationAlignment,
            paddingHorizontal: 20,
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

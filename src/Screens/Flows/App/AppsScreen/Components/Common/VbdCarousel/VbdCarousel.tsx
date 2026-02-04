import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { CarouselSlideItem, FullscreenBaseCarousel } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useBottomSheetModal, useNewDAppsV2, useThemedStyles, useTrendingDAppsV2 } from "~Hooks"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { VbdCarouselBottomSheet, VbdCarouselBottomSheetMetadata } from "./VbdCarouselBottomSheet"
import { VbdCarouselItem } from "./VbdCarouselItem"
import { VbdCarouselItemSkeleton } from "./VbdCarouselItemSkeleton"

type Props = {
    filterType: "new" | "popular"
    appIds: string[]
    isLoading?: boolean
}

export const VbdCarousel = ({ filterType, appIds, isLoading: propsIsLoading }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { data: vbdApps, isLoading: vbdLoading } = useVeBetterDaoDapps(true)

    const { newDapps, isLoading: isLoadingNewDapps } = useNewDAppsV2()
    const { trendingDapps, isLoading: isLoadingTrendingDapps } = useTrendingDAppsV2()

    const { ref, onOpen } = useBottomSheetModal()

    const isLoading = useMemo(
        () => propsIsLoading || vbdLoading || isLoadingNewDapps || isLoadingTrendingDapps,
        [propsIsLoading, vbdLoading, isLoadingNewDapps, isLoadingTrendingDapps],
    )

    const onPressItem = useCallback(
        (newMetadata: VbdCarouselBottomSheetMetadata) => {
            onOpen(newMetadata)
        },
        [onOpen],
    )

    const carouselDapps = useMemo(() => {
        if (filterType === "new") return newDapps
        return trendingDapps
    }, [filterType, newDapps, trendingDapps])

    const items = useMemo(() => {
        if (isLoading || !vbdApps?.length || !appIds.length) {
            const ids = appIds.length ? appIds : ["1", "2", "3"]
            return ids.map(appId => ({ content: <VbdCarouselItemSkeleton />, name: appId } satisfies CarouselSlideItem))
        }

        return appIds.map((appId, index) => {
            const app = vbdApps?.find(_app => _app.id === appId)
            return {
                content: (
                    <VbdCarouselItem
                        app={app!}
                        onPressItem={metadata => onPressItem({ ...metadata, carouselIndex: index, carouselDapps })}
                    />
                ),
                name: appId,
            } satisfies CarouselSlideItem
        })
    }, [appIds, isLoading, onPressItem, carouselDapps, vbdApps])

    const dotStyles = useMemo(() => {
        return {
            active: styles.activeDotStyle,
            default: styles.dotStyle,
        }
    }, [styles.activeDotStyle, styles.dotStyle])

    return (
        <>
            <FullscreenBaseCarousel
                padding={16}
                gap={8}
                data={items}
                itemHeight={257}
                rootStyle={styles.root}
                dotStyles={dotStyles}
            />

            <VbdCarouselBottomSheet bsRef={ref} />
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            gap: 16,
        },
        activeDotStyle: {
            backgroundColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_500,
        },
        dotStyle: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
        },
    })

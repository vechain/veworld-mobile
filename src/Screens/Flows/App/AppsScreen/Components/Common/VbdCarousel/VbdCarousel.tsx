import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { CarouselSlideItem, FullscreenBaseCarousel } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { VbdCarouselItem } from "./VbdCarouselItem"
import { VbdCarouselItemSkeleton } from "./VbdCarouselItemSkeleton"

type Props = {
    appIds: string[]
    isLoading?: boolean
}

export const VbdCarousel = ({ appIds, isLoading: propsIsLoading }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { data: vbdApps, isLoading: vbdLoading } = useVeBetterDaoDapps(true)

    const isLoading = useMemo(() => propsIsLoading || vbdLoading, [propsIsLoading, vbdLoading])

    const items = useMemo(() => {
        if (isLoading || !vbdApps?.length || !appIds.length)
            return appIds.map(
                appId => ({ content: <VbdCarouselItemSkeleton />, name: appId } satisfies CarouselSlideItem),
            )

        return appIds.map(appId => {
            const app = vbdApps?.find(_app => _app.id === appId)
            return {
                content: <VbdCarouselItem app={app!} />,
                name: appId,
            } satisfies CarouselSlideItem
        })
    }, [appIds, isLoading, vbdApps])

    const dotStyles = useMemo(() => {
        return {
            active: styles.activeDotStyle,
            default: styles.dotStyle,
        }
    }, [styles.activeDotStyle, styles.dotStyle])

    return (
        <FullscreenBaseCarousel
            padding={16}
            gap={8}
            data={items}
            itemHeight={257}
            rootStyle={styles.root}
            dotStyles={dotStyles}
        />
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

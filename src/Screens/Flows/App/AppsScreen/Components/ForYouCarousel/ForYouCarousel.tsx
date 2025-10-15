import React, { useCallback, useMemo, useState } from "react"
import { AnimatedFilterChips, BaseText, BaseView } from "~Components"
import { useNewDAppsV2, useTheme, useThemedStyles, useTrendingDAppsV2 } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VbdCarousel } from "../Common/VbdCarousel/VbdCarousel"
import { StringUtils } from "~Utils"
import { StyleSheet } from "react-native"

export const ForYouCarousel = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const [filter, setFilter] = useState<"new" | "popular">("popular")

    const onFilterPress = useCallback((value: "new" | "popular") => setFilter(value), [])

    const { isLoading: isLoadingNewDapps, newDapps } = useNewDAppsV2()
    const { isLoading: isLoadingTrendingDapps, trendingDapps } = useTrendingDAppsV2()

    const isLoading = useMemo(
        () => (filter === "new" ? isLoadingNewDapps : isLoadingTrendingDapps),
        [filter, isLoadingNewDapps, isLoadingTrendingDapps],
    )

    const newAppIds = useMemo(() => newDapps.map(app => app.id).slice(0, 10), [newDapps])

    const trendingAppIds = useMemo(() => trendingDapps.map(app => app.id).slice(0, 10), [trendingDapps])

    const appIds = useMemo(() => (filter === "new" ? newAppIds : trendingAppIds), [filter, newAppIds, trendingAppIds])

    return (
        <BaseView flexDirection="column" gap={16}>
            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" px={16}>
                <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.dappTitle}>
                    {LL.DISCOVER_FOR_YOU()}
                </BaseText>
                <AnimatedFilterChips
                    items={["popular", "new"]}
                    selectedItem={filter}
                    keyExtractor={(item: "new" | "popular") => item}
                    getItemLabel={(item: "new" | "popular") =>
                        LL[`DISCOVER_FOR_YOU_${StringUtils.toUppercase(item)}`]()
                    }
                    onItemPress={onFilterPress}
                    containerStyle={styles.container}
                    contentContainerStyle={styles.filterContainer}
                />
            </BaseView>
            <VbdCarousel appIds={appIds} isLoading={isLoading} />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            marginTop: -15,
        },
        filterContainer: {
            paddingHorizontal: 0,
        },
    })

import React, { useCallback, useMemo, useState } from "react"
import { BaseChip, BaseText, BaseView } from "~Components"
import { useNewDAppsV2, useTheme, useTrendingDAppsV2 } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VbdCarousel } from "../Common/VbdCarousel/VbdCarousel"

export const ForYouCarousel = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
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
                <BaseView flexDirection="row" gap={12}>
                    <BaseChip
                        label={LL.DISCOVER_FOR_YOU_POPULAR()}
                        active={filter === "popular"}
                        onPress={() => onFilterPress("popular")}
                    />
                    <BaseChip
                        label={LL.DISCOVER_FOR_YOU_NEW()}
                        active={filter === "new"}
                        onPress={() => onFilterPress("new")}
                    />
                </BaseView>
            </BaseView>
            <VbdCarousel appIds={appIds} isLoading={isLoading} />
        </BaseView>
    )
}

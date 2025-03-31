import React, { useCallback } from "react"
import { BaseView, BaseText, BaseSpacer, BaseSkeleton } from "~Components"
import { FlatList, ListRenderItemInfo } from "react-native"
import { useI18nContext } from "~i18n"
import { useTheme, useTrendingDApps } from "~Hooks"
import { DAppCard } from "./DAppCard"
import { DiscoveryDApp } from "~Constants"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

const LoadingSkeleton = () => {
    const theme = useTheme()
    return (
        <BaseView px={16}>
            <FlatList
                data={[1, 2, 3, 4, 5]}
                keyExtractor={item => item.toString()}
                scrollEnabled={false}
                horizontal
                shouldRasterizeIOS
                renderItem={() => (
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        layout={[
                            {
                                flexDirection: "column",
                                gap: 8,
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                children: [
                                    { width: 96, height: 96, borderRadius: 8, marginRight: 16 },
                                    { width: 80, height: 10 },
                                    { width: 40, height: 8 },
                                ],
                            },
                        ]}
                    />
                )}
            />
        </BaseView>
    )
}

export const PopularTrendingDApps = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { isLoading, trendingDapps } = useTrendingDApps()

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<DiscoveryDApp>) => {
            const isLast = index === trendingDapps.length - 1
            const columnsGap = 16

            const onPress = () => {
                nav.navigate(Routes.BROWSER, { url: item.href })
            }

            return (
                <BaseView pl={columnsGap} pr={isLast ? columnsGap : 0} justifyContent="center" alignItems="center">
                    <DAppCard dapp={item} onPress={onPress} />
                </BaseView>
            )
        },
        [nav, trendingDapps.length],
    )

    return (
        <BaseView>
            <BaseView flexDirection="row" justifyContent="space-between" px={16}>
                <BaseText typographyFont="bodySemiBold">{LL.DISCOVER_TAB_TRENDING_AND_POPULAR()}</BaseText>
            </BaseView>
            <BaseSpacer height={16} />

            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <FlatList
                    data={trendingDapps}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                />
            )}
        </BaseView>
    )
}

import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseSpacer, BaseView, DescSortIconHeaderButton, FavoriteDAppCard, Layout, ListEmptyResults } from "~Components"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import { addNavigationToDApp, selectBookmarkedDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { FavoritesStackCard } from "./Components"
import { groupFavoritesByBaseUrl } from "./utils"

export const FavouritesScreen = () => {
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)

    const renderSeparator = useCallback(() => <BaseSpacer height={12} />, [])
    const renderFooter = useCallback(() => <BaseSpacer height={24} />, [])

    const onDAppPress = useCallback(
        ({ href, custom }: { href: string; custom?: boolean }) => {
            nav.navigate(Routes.BROWSER, { url: href })

            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: href,
            })

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: href, isCustom: custom ?? false }))
            }, 1000)
        },
        [track, dispatch, nav],
    )

    const dappToShow = useMemo(() => groupFavoritesByBaseUrl(bookmarkedDApps), [bookmarkedDApps])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DiscoveryDApp[]>) => {
            return item.length === 1 ? (
                <FavoriteDAppCard dapp={item[0]} onDAppPress={onDAppPress} />
            ) : (
                <FavoritesStackCard dapps={item} onDAppPress={onDAppPress} />
            )
        },
        [onDAppPress],
    )

    return (
        <Layout
            hasSafeArea={true}
            hasTopSafeAreaOnly={false}
            title={LL.FAVOURITES_DAPPS_TITLE()}
            headerRightElement={<DescSortIconHeaderButton action={() => {}} />}
            fixedBody={
                <BaseView flex={1} px={24}>
                    <FlatList
                        contentContainerStyle={styles.listContentContainer}
                        data={dappToShow}
                        keyExtractor={(item, index) => item[0]?.href ?? index.toString()}
                        renderItem={renderItem}
                        ListFooterComponent={renderFooter}
                        ItemSeparatorComponent={renderSeparator}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <ListEmptyResults subtitle={LL.FAVOURITES_DAPPS_NO_RECORDS()} icon={"icon-search"} />
                        }
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        card: {
            height: 60,
        },
        nameText: {
            fontWeight: "bold",
            fontSize: 16,
        },
        description: {
            fontSize: 12,
        },
        listContentContainer: {
            flexGrow: 1,
            paddingTop: 12,
        },
    })

import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import {
    BaseSearchInput,
    BaseSpacer,
    BaseText,
    BaseView,
    FavoriteDAppCard,
    Layout,
    ListEmptyResults,
} from "~Components"
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

    const [filteredSearch, setFilteredSearch] = useState("")

    const renderSeparator = useCallback(() => <BaseSpacer height={12} />, [])
    const renderFooter = useCallback(() => <BaseSpacer height={24} />, [])

    const onTextChange = useCallback((text: string) => {
        setFilteredSearch(text)
    }, [])

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

    const dappToShow = useMemo(() => {
        const dapps =
            filteredSearch === ""
                ? bookmarkedDApps
                : bookmarkedDApps.filter(dapp => dapp.name.toLowerCase().includes(filteredSearch.toLowerCase()))

        return groupFavoritesByBaseUrl(dapps)
    }, [bookmarkedDApps, filteredSearch])

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
            noMargin
            hasSafeArea={true}
            hasTopSafeAreaOnly={false}
            fixedHeader={
                <BaseView px={24}>
                    <BaseText typographyFont="title">{LL.FAVOURITES_DAPPS_TITLE()}</BaseText>
                    <BaseSpacer height={12} />
                    <BaseSearchInput
                        placeholder={LL.FAVOURITES_DAPPS_SEARCH_PLACEHOLDER()}
                        setValue={onTextChange}
                        value={filteredSearch}
                        showIcon={filteredSearch.length > 0}
                        iconName="icon-x"
                        iconSize={18}
                        onIconPress={() => setFilteredSearch("")}
                    />
                    <BaseSpacer height={12} />
                </BaseView>
            }
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

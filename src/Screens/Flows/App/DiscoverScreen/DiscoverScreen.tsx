import React, { useCallback, useRef } from "react"
import { BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseTextInput, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { ColorThemeType, CompatibleDApp } from "~Constants"
import { useBrowserSearch, useThemedStyles } from "~Hooks"
import { NativeSyntheticEvent, StyleSheet, TextInputChangeEventData } from "react-native"
import { useNavigation, useScrollToTop } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { DAppList } from "~Screens/Flows/App/DiscoverScreen/Components/DAppList"
import { selectCustomDapps, selectFavoritesDapps, selectFeaturedDapps } from "~Storage/Redux"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { TabBar } from "./Components/TabBar"

export const DiscoverScreen: React.FC = () => {
    const { theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const [filteredSearch, setFilteredSearch] = React.useState<string>()

    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const { navigateToBrowser } = useBrowserSearch()

    const onTextChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setFilteredSearch(e.nativeEvent.text)
    }

    const onDAppPress = useCallback(
        (dapp: CompatibleDApp) => {
            nav.navigate(Routes.BROWSER, { initialUrl: dapp.href })
            setFilteredSearch(undefined)
        },
        [nav, setFilteredSearch],
    )

    const onSearch = useCallback(() => {
        if (!filteredSearch) return

        navigateToBrowser(filteredSearch)
        setFilteredSearch(undefined)
    }, [filteredSearch, navigateToBrowser, setFilteredSearch])

    const Tab = createMaterialTopTabNavigator()

    const FeaturedScreen = useCallback(
        () => <DAppList onDAppPress={onDAppPress} filteredSearch={filteredSearch} selector={selectFeaturedDapps} />,
        [filteredSearch, onDAppPress],
    )
    const FavouriteScreen = useCallback(
        () => <DAppList onDAppPress={onDAppPress} filteredSearch={filteredSearch} selector={selectFavoritesDapps} />,
        [filteredSearch, onDAppPress],
    )
    const PersonalScreen = useCallback(
        () => <DAppList onDAppPress={onDAppPress} filteredSearch={filteredSearch} selector={selectCustomDapps} />,
        [filteredSearch, onDAppPress],
    )

    return (
        <BaseSafeArea>
            <BaseText mx={24} typographyFont="largeTitle" testID="settings-screen" pb={16}>
                {LL.DISCOVER_TITLE()}
            </BaseText>

            {/*Search Bar*/}
            <BaseView w={100} flexDirection="row" px={24}>
                <BaseView flex={1}>
                    <BaseTextInput placeholder={LL.DISCOVER_SEARCH()} onChange={onTextChange} value={filteredSearch} />
                </BaseView>
                <BaseSpacer width={12} />
                <BaseIcon name={"search-web"} size={30} onPress={onSearch} color={theme.colors.primary} />
            </BaseView>

            <BaseSpacer height={16} />

            {/*Tab Navigator*/}
            <Tab.Navigator tabBar={TabBar}>
                <Tab.Screen
                    name={Routes.DISCOVER_FEATURED}
                    options={{ title: LL.DISCOVER_TAB_FEATURED() }}
                    component={FeaturedScreen}
                />
                <Tab.Screen
                    name={Routes.DISCOVER_FAVOURITES}
                    options={{ title: LL.DISCOVER_TAB_FAVOURITES() }}
                    component={FavouriteScreen}
                />
                <Tab.Screen
                    name={Routes.DISCOVER_PERSONAL}
                    options={{ title: LL.DISCOVER_TAB_PERSONAL() }}
                    component={PersonalScreen}
                />
            </Tab.Navigator>
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        tabBar: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.colors.background,
            whiteSpace: "nowrap",
            overflowX: "auto",
        },
        menuItemTick: {
            height: 2,
            width: 15,
            backgroundColor: theme.colors.secondary,
        },
        selectedTabButton: {
            backgroundColor: theme.colors.primary,
        },
        unselectedTabButton: {
            backgroundColor: theme.colors.info,
        },
        contentContainerStyle: {
            paddingHorizontal: 24,
        },
        searchContainer: {
            flex: 1,
        },
        image: {
            width: 60,
            height: 60,
        },
        separator: {
            backgroundColor: theme.colors.text,
            height: 5,
        },
        list: { flex: 1 },
    })

import React, { useCallback, useMemo, useRef } from "react"
import { BaseButton, BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseTextInput, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { ColorThemeType, DiscoveryDApp } from "~Constants"
import { useBrowserSearch, useThemedStyles } from "~Hooks"
import { NativeSyntheticEvent, StyleSheet, TextInputChangeEventData } from "react-native"
import { useNavigation, useScrollToTop } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { DAppList } from "~Screens/Flows/App/DiscoverScreen/Components/DAppList"
import { DAppTabType } from "~Model"
import { selectAllDapps, selectCustomDapps, selectFavoritesDapps, selectFeaturedDapps } from "~Storage/Redux"

type TabButton = {
    isActive: boolean
    title: string
    onPress: () => void
}
export const DiscoverScreen: React.FC = () => {
    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const [tab, setTab] = React.useState<DAppTabType>("favourites")
    const [filteredSearch, setFilteredSearch] = React.useState<string>()

    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const { navigateToBrowser } = useBrowserSearch()

    const onTextChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setFilteredSearch(e.nativeEvent.text)
    }

    const onDAppPress = useCallback(
        (dapp: DiscoveryDApp) => {
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

    const tabButtons: TabButton[] = useMemo(() => {
        return [
            {
                isActive: tab === "favourites",
                title: LL.DISCOVER_TAB_FAVOURITES(),
                onPress: () => setTab("favourites"),
            },
            {
                isActive: tab === "featured",
                title: LL.DISCOVER_TAB_FEATURED(),
                onPress: () => setTab("featured"),
            },
            {
                isActive: tab === "custom",
                title: LL.DISCOVER_TAB_CUSTOM(),
                onPress: () => setTab("custom"),
            },
            {
                isActive: tab === "all",
                title: LL.DISCOVER_TAB_ALL(),
                onPress: () => setTab("all"),
            },
        ]
    }, [tab, LL, setTab])

    const renderContent = useCallback(() => {
        let selector: (...state: any) => DiscoveryDApp[]

        switch (tab) {
            case "favourites":
                selector = selectFavoritesDapps
                break
            case "featured":
                selector = selectFeaturedDapps
                break
            case "custom":
                selector = selectCustomDapps
                break
            case "all":
                selector = selectAllDapps
                break
            default:
                return <></>
        }

        return (
            <DAppList
                onDAppPress={onDAppPress}
                setTab={setTab}
                filteredSearch={filteredSearch}
                tab={tab}
                selector={selector}
            />
        )
    }, [tab, onDAppPress, setTab, filteredSearch])

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

            {/*Tab Bar*/}
            <BaseView w={100} flexDirection="row" px={24} style={themedStyles.tabBar}>
                {tabButtons.map((tabButton, index) => {
                    return (
                        <BaseView key={index}>
                            <BaseButton
                                style={
                                    tabButton.isActive
                                        ? themedStyles.selectedTabButton
                                        : themedStyles.unselectedTabButton
                                }
                                action={tabButton.onPress}
                                title={tabButton.title}
                            />
                        </BaseView>
                    )
                })}
            </BaseView>

            <BaseSpacer height={16} />

            {/* Content */}
            <BaseView style={[themedStyles.list]}>{renderContent()}</BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        tabBar: {
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: theme.colors.background,
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

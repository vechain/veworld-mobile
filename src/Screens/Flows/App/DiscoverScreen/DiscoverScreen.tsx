import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { BaseIcon, BaseSpacer, BaseText, BaseTextInput, BaseView, Layout, SelectedNetworkViewer } from "~Components"
import { useI18nContext } from "~i18n"
import { AnalyticsEvent, ColorThemeType, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useBrowserSearch, useThemedStyles } from "~Hooks"
import { NativeSyntheticEvent, StyleSheet, TextInputChangeEventData } from "react-native"
import { useNavigation, useScrollToTop } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { DAppList } from "~Screens/Flows/App/DiscoverScreen/Components/DAppList"
import {
    addNavigationToDApp,
    selectBookmarkedDapps,
    selectFeaturedDapps,
    selectHasUserOpenedDiscovery,
    setDiscoverySectionOpened,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { TabBar } from "./Components/TabBar"
import Animated, { useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated"
import { PlatformUtils } from "~Utils"
import { useFetchFeaturedDApps } from "./Hooks/useFetchFeaturedDApps"
import { RumManager } from "~Test/RumManager"

export const DiscoverScreen: React.FC = () => {
    const { theme, styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const [filteredSearch, setFilteredSearch] = React.useState<string>()
    const animatedIconOpacity = useSharedValue(0)
    const animatedIconRightPosition = useSharedValue(-20)
    const { isLoading } = useFetchFeaturedDApps()

    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const { navigateToBrowser } = useBrowserSearch()
    const dispatch = useAppDispatch()

    /**
     * For metrics on discovery screen
     */
    const hasOpenedDiscovery = useAppSelector(selectHasUserOpenedDiscovery)
    const track = useAnalyticTracking()

    const ddLogger = useMemo(() => new RumManager(), [])

    useEffect(() => {
        if (!hasOpenedDiscovery) {
            track(AnalyticsEvent.DISCOVERY_SECTION_OPENED)
            dispatch(setDiscoverySectionOpened())
            ddLogger.logAction("DISCOVERY_SECTION", "DISCOVERY_SECTION_OPENED")
        }
    }, [track, hasOpenedDiscovery, dispatch, ddLogger])

    useEffect(() => {
        if (filteredSearch?.length) {
            animatedIconOpacity.value = withDelay(100, withTiming(1, { duration: 200 }))
            animatedIconRightPosition.value = withSpring(2.5)
        } else {
            animatedIconOpacity.value = withTiming(0, { duration: 150 })
            animatedIconRightPosition.value = withSpring(-20)
        }
    }, [animatedIconOpacity, animatedIconRightPosition, filteredSearch])

    const onTextChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setFilteredSearch(e.nativeEvent.text)
    }

    const onDAppPress = useCallback(
        (dapp: DiscoveryDApp) => {
            nav.navigate(Routes.BROWSER, { url: dapp.href })
            setFilteredSearch(undefined)

            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: dapp.href,
            })

            ddLogger.logAction("DISCOVERY_SECTION", "DISCOVERY_USER_OPENED_DAPP")

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: dapp.href, isCustom: dapp.isCustom }))
            }, 1000)
        },
        [track, dispatch, nav, setFilteredSearch, ddLogger],
    )

    const onSearch = useCallback(() => {
        if (!filteredSearch) return

        navigateToBrowser(filteredSearch)
        setFilteredSearch(undefined)
    }, [filteredSearch, navigateToBrowser, setFilteredSearch])

    const Tab = createMaterialTopTabNavigator()

    const FeaturedScreen = useCallback(
        () => (
            <DAppList
                isLoading={isLoading}
                onDAppPress={onDAppPress}
                filteredSearch={filteredSearch}
                selector={selectFeaturedDapps}
                setFilteredSearch={setFilteredSearch}
            />
        ),
        [filteredSearch, onDAppPress, setFilteredSearch, isLoading],
    )
    const FavouriteScreen = useCallback(
        () => (
            <DAppList
                onDAppPress={onDAppPress}
                filteredSearch={filteredSearch}
                selector={selectBookmarkedDapps}
                setFilteredSearch={setFilteredSearch}
            />
        ),
        [filteredSearch, onDAppPress, setFilteredSearch],
    )

    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)

    const initialRoute = useMemo(() => {
        if (bookmarkedDApps.length > 0) {
            return Routes.DISCOVER_FAVOURITES
        }

        return Routes.DISCOVER_FEATURED
    }, [bookmarkedDApps])

    const renderHeader = useMemo(() => {
        return (
            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" mx={24} pb={16}>
                <BaseText typographyFont="largeTitle" testID="settings-screen">
                    {LL.DISCOVER_TITLE()}
                </BaseText>

                <SelectedNetworkViewer />
            </BaseView>
        )
    }, [LL])

    return (
        <Layout
            fixedHeader={renderHeader}
            noBackButton
            noMargin
            fixedBody={
                <>
                    {/*Search Bar*/}
                    <BaseView w={100} flexDirection="row" px={24} pt={24}>
                        <BaseView flex={1}>
                            <BaseTextInput
                                placeholder={LL.DISCOVER_SEARCH()}
                                onChange={onTextChange}
                                value={filteredSearch}
                                style={styles.searchBar}
                            />
                            <Animated.View
                                style={[
                                    styles.searchIconContainer,
                                    {
                                        opacity: animatedIconOpacity,
                                        right: animatedIconRightPosition,
                                    },
                                ]}>
                                <BaseIcon
                                    name={"search-web"}
                                    size={25}
                                    action={onSearch}
                                    color={theme.colors.text}
                                    borderRadius={20}
                                />
                            </Animated.View>
                        </BaseView>
                    </BaseView>

                    <BaseSpacer height={16} />

                    {/*Tab Navigator*/}
                    <Tab.Navigator tabBar={TabBar} initialRouteName={initialRoute}>
                        <Tab.Screen
                            name={Routes.DISCOVER_FAVOURITES}
                            options={{ title: LL.DISCOVER_TAB_FAVOURITES() }}
                            component={FavouriteScreen}
                        />
                        {PlatformUtils.isAndroid() && (
                            <Tab.Screen
                                name={Routes.DISCOVER_FEATURED}
                                options={{ title: LL.DISCOVER_TAB_FEATURED() }}
                                component={FeaturedScreen}
                            />
                        )}
                    </Tab.Navigator>
                </>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        searchBar: {
            paddingVertical: 10,
            paddingRight: 35,
            height: 40,
        },
        searchIconContainer: {
            borderColor: theme.colors.text,
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            width: 40,
            height: 40,
        },
    })

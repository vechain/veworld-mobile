import React, { memo, useCallback, useEffect, useMemo, useRef } from "react"
import { BaseButton, BaseText, BaseView, Layout, SelectedNetworkViewer } from "~Components"
import { useI18nContext } from "~i18n"
import { AnalyticsEvent, DiscoveryDApp, SCREEN_WIDTH } from "~Constants"
import { useAnalyticTracking, useBrowserSearch, useKeyboard, useThemedStyles } from "~Hooks"
import { useNavigation, useScrollToTop } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { DAppList } from "~Screens/Flows/App/DiscoverScreen/Components/DAppList"
import {
    addNavigationToDApp,
    selectHasUserOpenedDiscovery,
    setDiscoverySectionOpened,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useFetchFeaturedDApps } from "./Hooks/useFetchFeaturedDApps"
import { RumManager } from "~Logging/RumManager"
import { StyleSheet } from "react-native"
import Animated, { ReduceMotion, useSharedValue, withSpring } from "react-native-reanimated"
import LinearGradient from "react-native-linear-gradient"
import { SearchBar } from "./Components/SearchBar"

export const DiscoverScreen: React.FC = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { isLoading } = useFetchFeaturedDApps()
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)
    const dispatch = useAppDispatch()
    const { navigateToBrowser } = useBrowserSearch()

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

    const onDAppPress = useCallback(
        (dapp: DiscoveryDApp) => {
            nav.navigate(Routes.BROWSER, { url: dapp.href })

            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: dapp.href,
            })

            ddLogger.logAction("DISCOVERY_SECTION", "DISCOVERY_USER_OPENED_DAPP")

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: dapp.href, isCustom: dapp.isCustom }))
            }, 1000)
        },
        [track, dispatch, nav, ddLogger],
    )

    const [filteredSearch, setFilteredSearch] = React.useState("")
    const onTextChange = (text: string) => {
        setFilteredSearch(text)
    }

    const mountButton = useMemo(() => {
        return !!filteredSearch.length
    }, [filteredSearch.length])

    const onSearch = useCallback(() => {
        if (!filteredSearch) return
        navigateToBrowser(filteredSearch)
    }, [filteredSearch, navigateToBrowser])

    const renderHeader = useMemo(() => {
        return (
            <>
                <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" mx={24}>
                    <BaseText typographyFont="largeTitle" testID="settings-screen">
                        {LL.DISCOVER_TITLE()}
                    </BaseText>

                    <SelectedNetworkViewer />
                </BaseView>

                <SearchBar onTextChange={onTextChange} />
            </>
        )
    }, [LL])

    return (
        <Layout
            fixedHeader={renderHeader}
            noBackButton
            noMargin
            hasSafeArea
            fixedBody={
                <>
                    <WebSearchPopUp onSearch={onSearch} mountButton={mountButton} />
                    <DAppList isLoading={isLoading} onDAppPress={onDAppPress} />
                </>
            }
        />
    )
}

const WebSearchPopUp = memo(({ onSearch, mountButton }: { onSearch: () => void; mountButton: boolean }) => {
    const { visible, bottomStyle } = useKeyboard()
    const bottom = useSharedValue(0)

    useEffect(() => {
        if (mountButton) {
            bottom.value = withSpring(bottomStyle, {
                mass: 1.2,
                damping: 22,
                stiffness: 190,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 2,
                reduceMotion: ReduceMotion.System,
            })
        } else {
            bottom.value = withSpring(-100, {
                mass: 1,
                damping: 10,
                stiffness: 230,
                overshootClamping: true,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 2,
                reduceMotion: ReduceMotion.System,
            })
        }
    }, [bottom, bottomStyle, mountButton, visible])

    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <>
            <Animated.View style={[styles.popUpContainer, { bottom }]}>
                <LinearGradient colors={[theme.colors.backgroundTransparent, theme.colors.background]}>
                    <BaseView mx={20} style={{ width: SCREEN_WIDTH - 40 }} pb={24}>
                        <BaseButton
                            size="lg"
                            haptics="Medium"
                            w={100}
                            title={"SEARCH THE WEB"}
                            action={onSearch}
                            activeOpacity={0.94}
                        />
                    </BaseView>
                </LinearGradient>
            </Animated.View>
        </>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        popUpContainer: {
            position: "absolute",
            bottom: -100,
            left: 0,
            right: 0,
            zIndex: 2,
        },
    })

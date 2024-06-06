import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BaseButton, BaseSpacer, BaseText, BaseTextInput, BaseView, Layout, SelectedNetworkViewer } from "~Components"
import { useI18nContext } from "~i18n"
import { AnalyticsEvent, ColorThemeType, DiscoveryDApp, SCREEN_WIDTH } from "~Constants"
import { useAnalyticTracking, useBrowserSearch, useKeyboard, useThemedStyles } from "~Hooks"
import { useNavigation, useScrollToTop } from "@react-navigation/native"
import { Routes } from "~Navigation"

import {
    addNavigationToDApp,
    selectFeaturedDapps,
    selectHasUserOpenedDiscovery,
    setDiscoverySectionOpened,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useFetchFeaturedDApps } from "./Hooks/useFetchFeaturedDApps"
import { RumManager } from "~Logging/RumManager"
import { FlatList, Keyboard, StyleSheet } from "react-native"
import Animated, {
    interpolate,
    ReduceMotion,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollViewOffset,
    useSharedValue,
    withSpring,
} from "react-native-reanimated"
import LinearGradient from "react-native-linear-gradient"
import { HeaderSection } from "./Components/HeaderSection"
import { DAppCard } from "./Components/DAppCard"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export enum DAppType {
    ALL = "all",
    SUSTAINABILTY = "sustainability",
    NFT = "NFT",
    DAPPS = "DAPPS",
}

const AnimatedBaseViewHeader = Animated.createAnimatedComponent(BaseView)
const AnimatedBaseViewInput = Animated.createAnimatedComponent(BaseView)
const AnimatedBaseViewHistoryIcon = Animated.createAnimatedComponent(BaseView)

Animated.addWhitelistedNativeProps({ text: true })

export const DiscoverScreen: React.FC = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    useFetchFeaturedDApps()
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)
    const dispatch = useAppDispatch()
    const { navigateToBrowser } = useBrowserSearch()
    const { styles, theme } = useThemedStyles(baseStyles)

    const hasOpenedDiscovery = useAppSelector(selectHasUserOpenedDiscovery)
    const track = useAnalyticTracking()
    const ddLogger = useMemo(() => new RumManager(), [])
    const [selectedDapps, setSelectedDapps] = useState(DAppType.ALL)

    const dapps: DiscoveryDApp[] = useAppSelector(selectFeaturedDapps)
    const filteredDapps = React.useMemo(() => {
        switch (selectedDapps) {
            case DAppType.ALL:
                return dapps

            case DAppType.SUSTAINABILTY:
                return dapps.filter(dapp => dapp.tags?.includes(DAppType.SUSTAINABILTY.toLowerCase()))

            case DAppType.NFT:
                return dapps.filter(dapp => dapp.tags?.includes(DAppType.NFT.toLowerCase()))

            case DAppType.DAPPS:
                return dapps.filter(
                    dapp =>
                        !dapp.tags?.includes(DAppType.NFT.toLowerCase()) &&
                        !dapp.tags?.includes(DAppType.SUSTAINABILTY.toLowerCase()),
                )

            default:
                return dapps
        }
    }, [dapps, selectedDapps])
    const renderSeparator = useCallback(() => <BaseSpacer height={24} />, [])

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

    const renderItem = useCallback(
        ({ item }: { item: DiscoveryDApp }) => {
            return <DAppCard dapp={item} onPress={onDAppPress} />
        },
        [onDAppPress],
    )

    const [filteredSearch, setFilteredSearch] = React.useState("")

    const onTextChange = useCallback((_text: string) => {
        setFilteredSearch(_text)
    }, [])

    const mountButton = useMemo(() => {
        return !!filteredSearch.length
    }, [filteredSearch.length])

    const onSearch = useCallback(() => {
        if (!filteredSearch) return
        Keyboard.dismiss()
        setFilteredSearch("")
        setTimeout(() => navigateToBrowser(filteredSearch), 300)
    }, [filteredSearch, navigateToBrowser])

    const animatedRef = useAnimatedRef<Animated.ScrollView>()
    const offset = useScrollViewOffset(animatedRef)
    const isInputActive = useSharedValue(false)

    const animatedStylesInput = useAnimatedStyle(() => {
        return {
            width: withSpring(isInputActive.value ? SCREEN_WIDTH : SCREEN_WIDTH / 1.3, {
                mass: 1.2,
                damping: 22,
                stiffness: 190,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 2,
                reduceMotion: ReduceMotion.System,
            }),
        }
    }, [isInputActive])

    const animatedStylesHeader = useAnimatedStyle(() => {
        if (offset.value < 0) {
            return {
                height: 40,
            }
        }

        if (offset.value > 200) {
            return {
                height: 0,
            }
        }

        return {
            opacity: interpolate(offset.value, [0, 100], [1, 0]),
            height: interpolate(offset.value, [0, 200], [40, 0]),
        }
    })

    const onNavigateToBrowserHistory = useCallback(() => {
        nav.navigate(Routes.DISCOVER_BROWSER_HISTORY)
    }, [nav])

    const renderScreenHeader = useMemo(() => {
        return (
            <>
                <AnimatedBaseViewHeader
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mx={24}
                    style={animatedStylesHeader}>
                    <BaseText typographyFont="largeTitle" testID="settings-screen">
                        {LL.DISCOVER_TITLE()}
                    </BaseText>

                    <SelectedNetworkViewer />
                </AnimatedBaseViewHeader>

                <BaseView flexDirection="row" justifyContent="space-between">
                    <AnimatedBaseViewInput
                        flexDirection="row"
                        px={24}
                        my={12}
                        bg="transparent"
                        style={animatedStylesInput}>
                        <BaseView flex={1}>
                            <BaseTextInput
                                placeholder={LL.DISCOVER_SEARCH()}
                                onChangeText={onTextChange}
                                value={filteredSearch}
                                style={[styles.searchBar]}
                                handleFocus={() => (isInputActive.value = true)}
                                handleBlur={() => (isInputActive.value = false)}
                            />
                        </BaseView>
                    </AnimatedBaseViewInput>

                    <AnimatedBaseViewHistoryIcon justifyContent="center" alignItems="flex-end">
                        <Icon
                            name="history"
                            size={32}
                            color={theme.colors.primary}
                            style={styles.iconStyle}
                            onPress={onNavigateToBrowserHistory}
                        />
                    </AnimatedBaseViewHistoryIcon>
                </BaseView>
            </>
        )
    }, [
        animatedStylesHeader,
        LL,
        animatedStylesInput,
        onTextChange,
        filteredSearch,
        styles.searchBar,
        styles.iconStyle,
        theme.colors.primary,
        onNavigateToBrowserHistory,
        isInputActive,
    ])

    return (
        <Layout
            fixedHeader={renderScreenHeader}
            noBackButton
            noMargin
            hasSafeArea
            fixedBody={
                <>
                    <WebSearchPopUp onSearch={onSearch} mountButton={mountButton} />

                    <Animated.ScrollView
                        ref={animatedRef}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}>
                        <HeaderSection setSelectedDapps={setSelectedDapps} />

                        <FlatList
                            ref={flatListRef}
                            data={filteredDapps}
                            contentContainerStyle={[styles.container]}
                            ItemSeparatorComponent={renderSeparator}
                            scrollEnabled={true}
                            keyExtractor={item => item.href}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            renderItem={renderItem}
                            numColumns={4}
                            columnWrapperStyle={styles.columnWrapperStyle}
                        />
                    </Animated.ScrollView>
                </>
            }
        />
    )
}

const WebSearchPopUp = memo(({ onSearch, mountButton }: { onSearch: () => void; mountButton: boolean }) => {
    const { visible, bottomStyle } = useKeyboard()
    const bottom = useSharedValue(-100)

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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        popUpContainer: {
            position: "absolute",
            bottom: -100,
            left: 0,
            right: 0,
            zIndex: 2,
        },

        // FLATLIST
        columnWrapperStyle: {
            marginHorizontal: 24,
        },
        container: {
            paddingBottom: 92, // TODO - 24 if button is not mounted and 92 if button is mounted
        },
        emptyListButton: {
            width: 250,
        },
        skeleton: {
            marginBottom: 10,
        },
        paddingTop: {
            paddingTop: 24,
        },

        // SEARCHBAR
        searchBar: {
            height: 40,
        },

        // ICON
        iconStyle: {
            paddingHorizontal: 24,
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

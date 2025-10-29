import React, { useCallback, useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import Animated, { ZoomIn, ZoomOut, LinearTransition } from "react-native-reanimated"
import { BaseIcon, BaseSimpleTabs, BaseSpacer, BaseTouchable, BaseView } from "~Components"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { AnalyticsEvent, COLORS, ColorThemeType } from "~Constants"
import { useTabBarBottomMargin, useThemedStyles, useHasAnyVeBetterActions, useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectBookmarkedDapps, selectHideNewUserVeBetterCard, selectSelectedAccount } from "~Storage/Redux/Selectors"
import { AccountUtils } from "~Utils"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import { FavouritesV2 } from "../../AppsScreen/Components/Favourites/FavouritesV2"
import { useDAppActions } from "../../AppsScreen/Hooks/useDAppActions"
import { useShowStakingTab } from "../Hooks/useShowStakingTab"
import { useNavigation } from "@react-navigation/native"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { NewUserVeBetterCard } from "../Components/VeBetterDao/NewUserVeBetterCard"
import { Tokens } from "./Tokens"
import { Staking } from "./Staking"
import { Collectibles } from "./Collectibles"
import { BannersCarousel } from "../Components/BannerCarousel"

const TABS = ["TOKENS", "STAKING", "COLLECTIBLES"] as const

type Props = {
    onLayout: (e: LayoutChangeEvent) => void
}

const AnimatedTouchable = Animated.createAnimatedComponent(wrapFunctionComponent(BaseTouchable))

export const TabRenderer = ({ onLayout }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("TOKENS")
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const hideNewUserVeBetterCard = useAppSelector(selectHideNewUserVeBetterCard)
    const { data: hasAnyVeBetterActions } = useHasAnyVeBetterActions()
    const { onDAppPress } = useDAppActions(Routes.HOME)
    const { tabBarBottomMargin } = useTabBarBottomMargin()
    const showStakingTab = useShowStakingTab()
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const { betterWorldFeature } = useFeatureFlags()

    const filteredTabs = useMemo(() => {
        return TABS.filter(tab => {
            if (tab === "STAKING") {
                return showStakingTab
            }
            if (tab === "COLLECTIBLES") {
                return betterWorldFeature.balanceScreen?.collectibles?.enabled
            }

            return true
        }) as (typeof TABS)[number][]
    }, [showStakingTab, betterWorldFeature.balanceScreen?.collectibles?.enabled])

    const showFavorites = useMemo(() => {
        return bookmarkedDApps.length > 0 && !AccountUtils.isObservedAccount(selectedAccount)
    }, [bookmarkedDApps.length, selectedAccount])
    const labels = useMemo(() => filteredTabs.map(tab => LL[`BALANCE_TAB_${tab}`]()), [LL, filteredTabs])

    const paddingBottom = useMemo(() => {
        return isAndroid() ? tabBarBottomMargin + 24 : 0
    }, [tabBarBottomMargin])

    const showNewUserVeBetterCard = useMemo(() => {
        return !hideNewUserVeBetterCard && !hasAnyVeBetterActions && selectedTab === "TOKENS"
    }, [hideNewUserVeBetterCard, hasAnyVeBetterActions, selectedTab])

    const rightIcon = useMemo(() => {
        if (selectedTab === "TOKENS") {
            return (
                <AnimatedTouchable
                    style={styles.manageTokens}
                    entering={ZoomIn.duration(100)}
                    exiting={ZoomOut.duration(100)}
                    onPress={() => nav.navigate(Routes.MANAGE_TOKEN)}>
                    <BaseIcon
                        name="icon-settings-2"
                        size={20}
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                    />
                </AnimatedTouchable>
            )
        }

        return null
    }, [theme.isDark, selectedTab, styles.manageTokens, nav])

    const onTabPress = useCallback(
        (tab: (typeof TABS)[number]) => {
            setSelectedTab(tab)
            if (tab === "COLLECTIBLES") {
                track(AnalyticsEvent.COLLECTIBLES_TAB_OPENED)
            }
        },
        [track],
    )

    return (
        <Animated.View style={[styles.root, { paddingBottom: tabBarBottomMargin }]} onLayout={onLayout}>
            <Animated.View layout={LinearTransition.duration(400)} style={styles.animatedContent}>
                {showFavorites && (
                    <BaseView flexDirection="column">
                        <FavouritesV2
                            bookmarkedDApps={bookmarkedDApps}
                            onDAppPress={onDAppPress}
                            renderCTASeeAll={false}
                            padding={24}
                            iconBg={theme.isDark ? COLORS.DARK_PURPLE : undefined}
                        />
                        <BaseSpacer height={24} />
                    </BaseView>
                )}

                {showNewUserVeBetterCard && (
                    <Animated.View layout={LinearTransition.duration(400)}>
                        <NewUserVeBetterCard />
                        <BaseSpacer height={18} />
                    </Animated.View>
                )}

                <BaseSimpleTabs
                    keys={filteredTabs}
                    labels={labels}
                    selectedKey={selectedTab}
                    setSelectedKey={onTabPress}
                    rootStyle={styles.tabs}
                    rightIcon={rightIcon}
                />
                <BaseView flexDirection="column" flex={1} pb={paddingBottom} px={24}>
                    {selectedTab === "TOKENS" && <Tokens isEmptyStateShown={showNewUserVeBetterCard} />}
                    {selectedTab === "STAKING" && <Staking />}
                    {selectedTab === "COLLECTIBLES" && <Collectibles />}
                </BaseView>
            </Animated.View>
            {showNewUserVeBetterCard && <BannersCarousel location="home_screen" />}
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            marginTop: -24,
            paddingTop: 24,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.LIGHT_GRAY,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            flex: 1,
            gap: 16,
            flexDirection: "column",
        },
        animatedContent: {
            flexDirection: "column",
            gap: 16,
        },
        tabs: {
            marginHorizontal: 24,
        },
        manageTokens: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            justifyContent: "center",
            alignItems: "center",
        },
    })

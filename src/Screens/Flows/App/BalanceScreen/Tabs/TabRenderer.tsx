import React, { useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSimpleTabs, BaseSpacer, BaseView } from "~Components"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { COLORS, ColorThemeType } from "~Constants"
import { useTabBarBottomMargin, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectBookmarkedDapps, selectSelectedAccount } from "~Storage/Redux/Selectors"
import { AccountUtils } from "~Utils"
import { FavouritesV2 } from "../../AppsScreen/Components/Favourites/FavouritesV2"
import { useDAppActions } from "../../AppsScreen/Hooks/useDAppActions"
import { Tokens } from "./Tokens"
import { Staking } from "./Staking"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import { useShowStakingTab } from "../Hooks/useShowStakingTab"
import { Collectibles } from "./Collectibles"

const TABS = ["TOKENS", "STAKING", "COLLECTIBLES"] as const

type Props = {
    onLayout: (e: LayoutChangeEvent) => void
}

export const TabRenderer = ({ onLayout }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("TOKENS")
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { onDAppPress } = useDAppActions(Routes.HOME)
    const { tabBarBottomMargin } = useTabBarBottomMargin()
    const showStakingTab = useShowStakingTab()
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
    const labels = useMemo(() => TABS.map(tab => LL[`BALANCE_TAB_${tab}`]()), [LL])

    const paddingBottom = useMemo(() => {
        return isAndroid() ? tabBarBottomMargin + 24 : 0
    }, [tabBarBottomMargin])

    return (
        <Animated.View style={[styles.root, { paddingBottom: tabBarBottomMargin }]} onLayout={onLayout}>
            {showFavorites && (
                <BaseView flexDirection="column">
                    <FavouritesV2
                        bookmarkedDApps={bookmarkedDApps}
                        onDAppPress={onDAppPress}
                        renderCTASeeAll={false}
                        style={styles.favorites}
                        iconBg={theme.isDark ? COLORS.DARK_PURPLE : undefined}
                    />
                    <BaseSpacer height={24} />
                </BaseView>
            )}
            <BaseSimpleTabs
                keys={filteredTabs}
                labels={labels}
                selectedKey={selectedTab}
                setSelectedKey={setSelectedTab}
            />
            <BaseView flexDirection="column" flex={1} pb={paddingBottom}>
                {selectedTab === "TOKENS" && <Tokens />}
                {selectedTab === "STAKING" && <Staking />}
                {selectedTab === "COLLECTIBLES" && <Collectibles />}
            </BaseView>
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            marginTop: -24,
            paddingBottom: 24,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.LIGHT_GRAY,
            padding: 16,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            flex: 1,
            gap: 16,
            flexDirection: "column",
        },
        favorites: {
            marginLeft: -16,
        },
    })

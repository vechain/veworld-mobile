import React, { useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSimpleTabs, BaseSpacer, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useTabBarBottomMargin, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectBookmarkedDapps, selectSelectedAccount } from "~Storage/Redux/Selectors"
import { AccountUtils } from "~Utils"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import { FavouritesV2 } from "../../AppsScreen/Components/Favourites/FavouritesV2"
import { useDAppActions } from "../../AppsScreen/Hooks/useDAppActions"
import { useShowStakingTab } from "../Hooks/useShowStakingTab"
import { Staking } from "./Staking"
import { Tokens } from "./Tokens"

const TABS = ["TOKENS", "STAKING"] as const

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

    const filteredTabs = useMemo(() => {
        return TABS.filter(tab => {
            if (tab === "STAKING") {
                return showStakingTab
            }

            return true
        }) as (typeof TABS)[number][]
    }, [showStakingTab])

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
                        padding={24}
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
                rootStyle={styles.tabs}
            />
            <BaseView flexDirection="column" flex={1} pb={paddingBottom} px={24}>
                {selectedTab === "TOKENS" && <Tokens />}
                {selectedTab === "STAKING" && <Staking />}
                {/* {selectedTab === "COLLECTIBLES" && <></>} */}
            </BaseView>
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
        tabs: {
            marginHorizontal: 24,
        },
    })
